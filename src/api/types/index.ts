// Tipe data untuk autentikasi
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthCredentials {
  name: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Tipe data untuk tempat wisata
export interface CulturalSpot {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    province: string;
  };
  images: string[];
  tags: string[];
}

// Tipe data untuk event
export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  images: string[];
}

// Tipe data untuk diskusi/forum
export interface Thread {
  id: string;
  title: string;
  author: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  author: UserProfile;
  content: string;
  createdAt: string;
}

// Tipe respons umum
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
} 