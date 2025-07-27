export interface Event {
  id: string; // uuid
  created_at: Date;
  name: string;
  location_id?: string;
  description?: string;
  start_date?: Date;
  end_date?: Date;
  is_kid_friendly?: boolean;
  views?: number;
  image_url?: string;
  city_id?: string;
  province_id?: string;
  user_id?: string;

  // Optional relations
  city?: any; // Avoid circular dependency
  province?: any; // Avoid circular dependency
  location?: any; // Avoid circular dependency
  user?: any; // Avoid circular dependency
  threads?: any[]; // Avoid circular dependency
}
