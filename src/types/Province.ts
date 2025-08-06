import { Event } from "./Event";

export interface Province {
  id: string; // uuid
  name: string;
  description?: string;
  createdAt: Date;

  // Optional relations
  events?: Event[];
}
