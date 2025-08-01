import { City } from "./City";
import { Event } from "./Event";
import { Location } from "./Location";
import { Province } from "./Province";

export interface SearchResult {
  type: "event" | "city" | "province" | "location";
  data: Event | City | Province | Location;
  relevanceScore: number;
}

export interface SearchRequest {
  query: string;
  limit?: number;
  types?: ("event" | "city" | "province" | "location")[];
} 