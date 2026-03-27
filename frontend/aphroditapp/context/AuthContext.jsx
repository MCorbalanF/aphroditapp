import React, { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react';
import { authAPI } from '../api/auth';
import { extractError } from '../api/axios';
import { useColorScheme } from 'react-native';
import { PaperDarkTheme, PaperLightTheme } from '@/constants/theme';
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from 'expo-router';
import storageService from '../services/storage';
// ─── State ────────────────────────────────────────────────────────────────────

const initialState = {
  user: null,
  token: null,
  refresh: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function authReducer(state, action) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isAuthenticated: Boolean(action.token),
        isLoading: false,
      };
    case 'LOGIN':
      return {
        ...state,
        token: action.token,
        user: action.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.error, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.user } };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigation = useNavigation();
  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await storageService.get('auth_token');
        const refresh = await storageService.get('auth_refresh');
        const userRaw = await storageService.get('auth_user');
        const user = userRaw ? JSON.parse(userRaw) : null;
        //navigation.navigate('index');
        if (token && user) {
          dispatch({ type: 'RESTORE_TOKEN', token, user, refresh });
          router.replace('/auth/home')
        } else {
          dispatch({ type: 'LOGOUT', token, user, refresh });
        };


      } catch (e) {
        dispatch({ type: 'RESTORE_TOKEN', token: null, user: null, refresh: null });
        router.replace('/')

      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (username, password) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });

    try {
      const response = await authAPI.login(username, password);
      const { tokens, user, refresh } = response.data.data;

      await storageService.set('auth_token', tokens.access);
      await storageService.set('auth_refresh', tokens.refresh);
      await storageService.setJSON('auth_user', user);

      dispatch({ type: 'LOGIN', token: tokens.access, user, refresh });
      navigation.navigateDeprecated('auth', { screen: 'home' });

      return { success: true, data: response.data.data };
    } catch (e) {
      const errorMsg = extractError(e);
      dispatch({ type: 'SET_ERROR', error: errorMsg });
      return { success: false, error: errorMsg };
    }

  }, []);

  const register = useCallback(async (formData) => {
    dispatch({ type: 'SET_LOADING', isLoading: true });
    try {
      const response = await authAPI.register(formData);
      const { tokens, user, refresh } = response.data.data;
      await storageService.set('auth_token', tokens.access);
      await storageService.setJSON('auth_user', user);
      await storageService.set('auth_refresh', tokens.refresh);

      dispatch({ type: 'LOGIN', user, refresh });
      navigation.navigateDeprecated('auth', { screen: 'home' });
      return { success: true, data: response.data.data };
      
    } catch (e) {
      const errorMsg = extractError(e);
      dispatch({ type: 'SET_ERROR', error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (_) { }

    await storageService.remove('auth_token');
    await storageService.remove('auth_user');
    await storageService.remove('auth_refresh');

    dispatch({ type: 'LOGOUT' });
  }, []);

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', user: userData });
    storageService.setJSON('auth_user', { ...state.user, ...userData });
  }, [state.user]);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);




  //-----------------------------------------------------------------------------------------------------------------user Configuration
    const systemTheme = useColorScheme(); // Oscuro o claro según el sistema

  const [theme, setTheme] = useState(systemTheme);

  const locales = Localization.getLocales();
  const systemLanguage = locales[0]?.languageCode; // Idioma del dispositivo
  const finalTheme = theme || "auto";
  const MDTheme =
    finalTheme === "dark"
      ? PaperDarkTheme
      : finalTheme === "light"
        ? PaperLightTheme
        : systemTheme === "dark"
          ? PaperDarkTheme
          : PaperLightTheme;

  const [language, setLanguage] = useState(systemLanguage);
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        clearError,
        language,
        updateTheme,
        theme,
        MDTheme,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};




