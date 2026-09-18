import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// const ip = 'http://172.25.14.251:3000';
// const ip = 'http://192.168.1.9:3000';
const ip = 'http://172.25.2.36:3000';

export const env = {
  apiUrl: (extra.apiUrl as string) ?? process.env.EXPO_PUBLIC_API_URL ?? ip,
  supabaseUrl: (extra.supabaseUrl as string) ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey:
    (extra.supabaseAnonKey as string) ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  socketUrl: (extra.socketUrl as string) ?? process.env.EXPO_PUBLIC_SOCKET_URL ?? ip,
  agoraAppId: (extra.agoraAppId as string) ?? process.env.EXPO_PUBLIC_AGORA_APP_ID ?? '',
  livekitUrl: (extra.livekitUrl as string) ?? process.env.EXPO_PUBLIC_LIVEKIT_URL ?? '',
  useMockApi: (extra.useMockApi as boolean) ?? process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
  isDev: __DEV__,
} as const;
