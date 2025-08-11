export interface User {
  id: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
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
  fullname: string;
  bio?: string;
  phone?: string;
}
