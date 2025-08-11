import { City } from "./City";

export interface Location {
  id: string;
  name: string;
  city_id: string;
  latitude: number;
  longitude: number;
  created_at?: string;
  updated_at?: string;

  city: City;
}

export interface LocationPayload {
  name: string;
  city_id: string;
  latitude: number;
  longitude: number;
}

export interface LocationOptions {
  city_id?: string;
  province_id?: string;
}
