export interface Location {
  id: string; // uuid
  name: string;
  city_id?: string;
  latitude: number;
  longitude: number;
  created_at: Date;

  // Optional relations
  city?: any; // Avoid circular dependency
  events?: any[]; // Avoid circular dependency
}