import { User } from "./User";

export interface UserProfile {
  id: string;
  fullname: string;
  bio?: string | null;
  avatar_url?: string | null;
  identity_image_url?: string | null;
  created_at?: string;
  updated_at?: string;

  user: User;
}

export interface UserProfilePayload {
  id: string;
  fullname: string;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UpdateAvatar {
  id: string;
  image?: File | { uri: string; type?: string; name?: string };
  avatar_url?: string | null;
}

export interface UpdateIdentity {
  id: string;
  image?: File | { uri: string; type?: string; name?: string };
  identity_image_url?: string | null;
}
