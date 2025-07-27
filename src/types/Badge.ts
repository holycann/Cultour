export interface Badge {
  id: string; // uuid
  name: string;
  description?: string;
  icon_url?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface UserBadge {
  id: string; // uuid
  user_id: string;
  badge_id: string;
  created_at: Date;
  user?: any; // Avoid circular dependency
  badge?: Badge;
}
