export interface Badge {
  id: string; // uuid
  name: string;
  description: string;
  icon_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  created_at?: string;
  updated_at?: string;
}
