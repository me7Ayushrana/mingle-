import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  corsOrigin: process.env['CORS_ORIGIN'] ?? '*',

  // Database
  databaseUrl:
    process.env['DATABASE_URL'] ||
    process.env['MONGODB_URI'] ||
    process.env['MONGO_URI'] ||
    'mongodb+srv://itsayushr7_db_user:sIZPfVxz2BFDQWBq@cluster0.4cprbcb.mongodb.net/mingle?retryWrites=true&w=majority&appName=Cluster0',

  // Supabase
  supabaseUrl: process.env['SUPABASE_URL'] ?? '',
  supabaseServiceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] ?? '',

  // JWT
  jwtSecret: process.env['JWT_SECRET'] || 'mingle_super_secret_jwt_key_2026_xyz_production',
  jwtRefreshSecret: process.env['JWT_REFRESH_SECRET'] || 'mingle_super_secret_refresh_jwt_key_2026_xyz_production',
  jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '15m',
  jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',

  // Agora
  agoraAppId: process.env['AGORA_APP_ID'] ?? '',
  agoraAppCertificate: process.env['AGORA_APP_CERTIFICATE'] ?? '',

  // LiveKit
  livekitApiKey: process.env['LIVEKIT_API_KEY'] ?? '',
  livekitApiSecret: process.env['LIVEKIT_API_SECRET'] ?? '',
  livekitUrl: process.env['LIVEKIT_URL'] ?? '',

  isDev: (process.env['NODE_ENV'] ?? 'development') === 'development',
} as const;
