import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { initSocket } from './socket';

import { config } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Connect to MongoDB
connectDB();

// Route imports
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import momentsRoutes from './routes/moments.routes';
import chatsRoutes from './routes/chats.routes';
import groupsRoutes from './routes/groups.routes';
import moderationRoutes from './routes/moderation.routes';
import onboardingRoutes from './routes/onboarding.routes';
import voiceRoutes from './routes/voice.routes';
import discoveryRoutes from './routes/discovery.routes';
import matchesRoutes from './routes/matches.routes';
import spotifyRoutes from './routes/spotify.routes';
import musicRoutes from './routes/music.routes';
import sharedPlaylistRoutes from './routes/sharedPlaylist.routes';
import musicMessagesRoutes from './routes/musicMessages.routes';

const app = express();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan(config.isDev ? 'dev' : 'combined'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Mingle API', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API Routes (Support both / and /api prefixes)
// ---------------------------------------------------------------------------
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

app.use('/users', usersRoutes);
app.use('/api/users', usersRoutes);

app.use('/discovery', discoveryRoutes);
app.use('/api/discovery', discoveryRoutes);

app.use('/matches', matchesRoutes);
app.use('/api/matches', matchesRoutes);

app.use('/moments', momentsRoutes);
app.use('/api/moments', momentsRoutes);

app.use('/chats', chatsRoutes);
app.use('/api/chats', chatsRoutes);

app.use('/groups', groupsRoutes);
app.use('/api/groups', groupsRoutes);

app.use('/moderation', moderationRoutes);
app.use('/api/moderation', moderationRoutes);

app.use('/onboarding', onboardingRoutes);
app.use('/api/onboarding', onboardingRoutes);

app.use('/voice', voiceRoutes);
app.use('/api/voice', voiceRoutes);

app.use('/spotify', spotifyRoutes);
app.use('/api/spotify', spotifyRoutes);

app.use('/music', musicRoutes);
app.use('/api/music', musicRoutes);

app.use('/playlists', sharedPlaylistRoutes);
app.use('/api/playlists', sharedPlaylistRoutes);

app.use('/chats', musicMessagesRoutes);
app.use('/api/chats', musicMessagesRoutes);

// ---------------------------------------------------------------------------
// Error handling
// ---------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`
  🚀 Mingle API Server Running
  ───────────────────────────
  Environment : ${config.nodeEnv}
  Port        : ${config.port}
  Health      : http://localhost:${config.port}/health
  ───────────────────────────
  `);
});

export default app;
