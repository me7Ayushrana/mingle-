import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { StorageKeys } from '@/constants/storage';

const isWeb = Platform.OS === 'web';

export const cacheStorage = {
  async getString(key: string): Promise<string | null> {
    return AsyncStorage.getItem(`cache:${key}`);
  },
  async set(key: string, value: string | number | boolean) {
    await AsyncStorage.setItem(`cache:${key}`, String(value));
  },
  async delete(key: string) {
    await AsyncStorage.removeItem(`cache:${key}`);
  },
};

export const secureStorage = {
  async getToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(StorageKeys.accessToken);
      }
      return await SecureStore.getItemAsync(StorageKeys.accessToken);
    } catch {
      return null;
    }
  },
  async setToken(token: string) {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(StorageKeys.accessToken, token);
      } else {
        await SecureStore.setItemAsync(StorageKeys.accessToken, token);
      }
    } catch (e) {
      console.error('setToken error', e);
    }
  },
  async getRefreshToken(): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(StorageKeys.refreshToken);
      }
      return await SecureStore.getItemAsync(StorageKeys.refreshToken);
    } catch {
      return null;
    }
  },
  async setRefreshToken(token: string) {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(StorageKeys.refreshToken, token);
      } else {
        await SecureStore.setItemAsync(StorageKeys.refreshToken, token);
      }
    } catch (e) {
      console.error('setRefreshToken error', e);
    }
  },
  async clearTokens() {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(StorageKeys.accessToken);
        await AsyncStorage.removeItem(StorageKeys.refreshToken);
      } else {
        await SecureStore.deleteItemAsync(StorageKeys.accessToken);
        await SecureStore.deleteItemAsync(StorageKeys.refreshToken);
      }
    } catch (e) {
      console.error('clearTokens error', e);
    }
  },
};

export const persistentStorage = {
  async get(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async set(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
  async getBoolean(key: string): Promise<boolean> {
    const val = await AsyncStorage.getItem(key);
    return val === 'true';
  },
  async setBoolean(key: string, value: boolean) {
    await AsyncStorage.setItem(key, value.toString());
  },
};
