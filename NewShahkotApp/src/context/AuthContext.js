import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { authAPI, notificationsAPI } from '../services/api';

const AuthContext = createContext(null);

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  // isNewUser is now only a transient hint; the source of truth is AsyncStorage 'pendingOnboarding'
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const normalizeUser = (rawUser) => {
    if (!rawUser) return rawUser;
    return {
      ...rawUser,
      canPostJobs: !!rawUser.canPostJobs,
      jobPostRequestPending: !!rawUser.jobPostRequestPending,
    };
  };

  // Register for push notifications and save token to backend
  const registerPushToken = async () => {
    try {
      if (!Device.isDevice) return; // Does not work on emulator/simulator

      // Create the high-priority notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('apnashahkot_default', {
          name: 'Ahwal e Shahkot',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#0C8A43',
          sound: 'default',
          enableLights: true,
          enableVibrate: true,
          showBadge: true,
        });
      }

      // Request permission (required on iOS 12+ and Android 13+)
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      // Get the native device push token (works for both FCM and APNs)
      const pushToken = (await Notifications.getDevicePushTokenAsync()).data;
      if (!pushToken) return;

      // Save to backend
      await notificationsAPI.saveFcmToken(pushToken);
    } catch (err) {
      // Non-critical — don't crash the app
      console.warn('Push token registration failed:', err.message);
    }
  };

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(normalizeUser(JSON.parse(storedUser)));
      }
    } catch (error) {
      console.error('Auth load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData) => {
    const response = await authAPI.login(loginData);
    const { token: newToken, user: rawUser } = response.data;
    const newUser = normalizeUser(rawUser);

    await Promise.all([
      AsyncStorage.setItem('token', newToken),
      AsyncStorage.setItem('user', JSON.stringify(newUser)),
    ]);

    setToken(newToken);
    setUser(newUser);

    // Register push token after login succeeds
    registerPushToken();

    return newUser;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token: newToken, user: rawUser } = response.data;
    const newUser = normalizeUser(rawUser);

    // STEP 1: Mark pending onboarding in storage BEFORE auth state flips
    // This is more reliable than in-memory state for cross-render communication
    await AsyncStorage.setItem('pendingOnboarding', 'true');
    await AsyncStorage.removeItem('hasSeenOnboarding');

    // STEP 2: Save token and user
    await Promise.all([
      AsyncStorage.setItem('token', newToken),
      AsyncStorage.setItem('user', JSON.stringify(newUser)),
    ]);

    // STEP 3: Update state LAST — this triggers isAuthenticated = true
    setToken(newToken);
    setUser(newUser);

    // Register push token after registration succeeds
    registerPushToken();

    return newUser;
  };

  const logout = async () => {
    // Remove FCM token from backend so user stops receiving pushes
    try {
      await notificationsAPI.removeFcmToken();
    } catch (_) {}
    // Keep hasSeenOnboarding so returning users only see greeting
    await AsyncStorage.multiRemove(['token', 'user']);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const normalized = normalizeUser(updatedUser);
    setUser(normalized);
    AsyncStorage.setItem('user', JSON.stringify(normalized));
  };

  const isAdmin = user?.role === 'ADMIN';
  const isVerified = user?.role === 'VERIFIED_USER' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isVerified,
        isAuthenticated: !!token,
        isNewUser,
        setIsNewUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
