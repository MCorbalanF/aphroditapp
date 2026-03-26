import React, { createContext, useContext, useEffect, useReducer, useCallback, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
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

      dispatch({ type: 'LOGIN', token, user, refresh });
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
  const [theme, setTheme] = useState(MDTheme);

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






/*
import { ColorSchemeName, useColorScheme } from "react-native";
import {
  PaperDarkTheme as DarkTheme,
  PaperLightTheme as LightTheme,
} from "@/constants/theme";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { authService } from "../services/authService";
import { getAccessToken, getRefreshToken, clearTokens } from "../constants/api";
import { LoginPayload, RegisterPayload, User } from "../services/types";

import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── State ─────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "LOGOUT" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    case "LOGOUT":
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export const useAuth = () => useContext(AuthContext);

// ─── Provider ──────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  //-----------------------------------------------------------------------------------------------------------------user Configuration
  const systemTheme = useColorScheme(); // Oscuro o claro según el sistema
  const locales = Localization.getLocales();
  const systemLanguage = locales[0]?.languageCode; // Idioma del dispositivo
  const [theme, setTheme] = useState<ColorSchemeName>(systemTheme);
  const finalTheme = theme || "auto";
  const MDTheme =
    finalTheme === "dark"
      ? DarkTheme
      : finalTheme === "light"
        ? LightTheme
        : systemTheme === "dark"
          ? DarkTheme
          : LightTheme;

  const [language, setLanguage] = useState<string>(systemLanguage);
  const updateTheme = (newTheme: ColorSchemeName) => {
    setTheme(newTheme);
    AsyncStorage.setItem("theme", newTheme);
  };

  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Al arrancar, comprueba si ya hay token guardado
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const user = await authService.getMe();
          dispatch({ type: "SET_USER", payload: user });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      } catch {
        await clearTokens();
        dispatch({ type: "LOGOUT" });
      }
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await authService.login(payload);
      const user = await authService.getMe();
      dispatch({ type: "SET_USER", payload: user });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "Error al iniciar sesión";
      dispatch({ type: "SET_ERROR", payload: msg });
      throw err;
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await authService.register(payload);
      // Auto-login después de registrarse
      await authService.login({
        email: payload.email,
        password: payload.password,
      });
      const user = await authService.getMe();
      dispatch({ type: "SET_USER", payload: user });
    } catch (err: any) {
      const firstError = Object.values(err?.response?.data ?? {})?.[0];
      const msg = Array.isArray(firstError)
        ? firstError[0]
        : typeof firstError === "string"
          ? firstError
          : "Error al registrarse";
      dispatch({ type: "SET_ERROR", payload: msg });
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refresh = await getRefreshToken();
      if (refresh) await authService.logout(refresh);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getMe();
      dispatch({ type: "SET_USER", payload: user });
    } catch {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "SET_ERROR", payload: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        theme,
        updateTheme,
        language,
        setLanguage,
        // setCountry: updateCountry,
        MDTheme,
        ...state,
        login,
        register,
        logout,
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
*/