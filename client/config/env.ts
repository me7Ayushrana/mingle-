import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const DEFAULT_PROD_URL = 'https://mingle-api-dukk.onrender.com';

const rawApiUrl =
  (extra.apiUrl as string) ||
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__ ? 'http://localhost:3000' : DEFAULT_PROD_URL);

const rawSocketUrl =
  (extra.socketUrl as string) ||
  process.env.EXPO_PUBLIC_SOCKET_URL ||
  (__DEV__ ? 'http://localhost:3000' : DEFAULT_PROD_URL);

export const env = {
  apiUrl: rawApiUrl.replace(/\/+$/, ''),
  supabaseUrl: (extra.supabaseUrl as string) || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey:
    (extra.supabaseAnonKey as string) || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  socketUrl: rawSocketUrl.replace(/\/+$/, ''),
  agoraAppId: (extra.agoraAppId as string) || process.env.EXPO_PUBLIC_AGORA_APP_ID || '',
  livekitUrl: (extra.livekitUrl as string) || process.env.EXPO_PUBLIC_LIVEKIT_URL || '',
  useMockApi: (extra.useMockApi as boolean) ?? process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
  isDev: __DEV__,
} as const;
