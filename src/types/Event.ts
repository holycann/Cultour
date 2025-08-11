import { Location, LocationPayload } from "./Location";
import { User } from "./User";

export interface Event {
  id: string;
  name: string;
  description: string;
  image_url: string;
  start_date: string; // ISO date-time
  end_date: string; // ISO date-time
  is_kid_friendly: boolean;
  views?: { views: number };
  created_at?: string;
  updated_at?: string;

  location: Location;
  creator: User;
}

export interface EventCreate {
  name: string;
  description: string;
  start_date: string; // ISO date-time
  end_date: string; // ISO date-time
  is_kid_friendly: boolean;
  image: (string | null)[];

  location?: LocationPayload;
}

export interface EventUpdate {
  id: string;
  location_id: string;
  name: string;
  description: string;
  start_date: string; // ISO date-time
  end_date: string; // ISO date-time
  image_url: string;
  is_kid_friendly: boolean;
  image: (string | null)[];

  Location: LocationPayload;
}

export interface EventOptions {
  location_id?: string;
  city_id?: string;
  province_id?: string;
  is_kid_friendly?: boolean;
}
