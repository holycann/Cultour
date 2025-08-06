import { City } from "./City";
import { Location } from "./Location";
import { Province } from "./Province";
import { User } from "./User";

export interface Event {
  id: string;
  created_at: Date;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_kid_friendly?: boolean;
  views?: number;
  image_url?: string;
  image?: (string | null)[];
  user_id?: string;
  city_id?: string;

  // Optional relations
  city?: City; // Avoid circular dependency
  province?: Province; // Avoid circular dependency
  location?: Location; // Avoid circular dependency
  user?: User; // Avoid circular dependency
}
