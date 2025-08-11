import { City } from "./City";
import { Event } from "./Event";

export interface SearchResult {
  type: "event" | "place";
  data: Event | City;
}

export interface SearchRequest {
  query: string;
  types?: ("event" | "place")[];
}
