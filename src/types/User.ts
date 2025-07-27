export interface User {
  id: string;
  email: string;
  password?: string; // Not returned, only used for registration
  role: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserProfile {
  id: string;
  user_id: string;
  fullname: string;
  bio: string;
  avatar_url: string;
  identity_image_url: string;
  created_at: Date;
}

/**
 * Authentication credentials
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Registration data extending auth credentials
 */
export interface RegistrationData extends AuthCredentials {
  role?: string;
  fullname?: string;
}

/**
 * User type for authentication response
 */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}