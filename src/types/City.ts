export interface City {
  id: string; // uuid
  name: string;
  province: string;
  image_url: string;
  created_at: Date;
  locations?: Location[]; // Avoid circular dependency
  events?: Event[]; // Avoid circular dependency
}
