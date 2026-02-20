// ─── Auth ──────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ─── User ──────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
  profile?: Profile;
}

// ─── Profile ──────────────────────────────────────────────────────────────
export interface Profile {
  id: number;
  user: number;
  bio?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  bio?: string;
  phone?: string;
  location?: string;
  birth_date?: string;
  first_name?: string;
  last_name?: string;
}

// ─── API responses ─────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  non_field_errors?: string[];
  [key: string]: string | string[] | undefined;
}

// ─── Navigation ────────────────────────────────────────────────────────────
export type RootStackParamList = {
  '(auth)/login': undefined;
  '(auth)/register': undefined;
  '(tabs)/index': undefined;
  '(tabs)/profile': undefined;
  '(tabs)/settings': undefined;
};