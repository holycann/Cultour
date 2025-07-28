import "dotenv/config";

/**
 * App configuration
 */
export const appConfig = {
  // App information
  app: {
    name: "Cultour",
    version: "1.0.0",
    description: "Social platform for community connections",
    author: "Cultour Team",
    website: "https://lingkar.app",
  },
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },

  // App features configuration
  features: {
    // Authentication features
    auth: {
      enabled: true,
      guestMode: false,
      socialLogin: {
        google: true,
        facebook: false,
        apple: false,
      },
      twoFactorAuth: false,
    },

    // Social features
    social: {
      // Event features
      events: {
        create: true,
        join: true,
        categories: true,
        maxParticipants: 100,
      },

      // Messaging features
      messaging: {
        enabled: true,
        groupChats: true,
        threadSupport: true,
      },

      // Location features
      location: {
        sharing: true,
        eventDiscovery: true,
        cityBasedFilters: true,
      },
    },

    // Profile features
    profile: {
      editProfile: true,
      badges: true,
      socialConnections: true,
      activityHistory: true,
    },

    // Appearance features
    appearance: {
      darkMode: true,
      customTheme: false,
      fontSizeAdjustment: true,
    },
  },

  // App constants
  constants: {
    // Animation durations
    animation: {
      short: 200,
      medium: 300,
      long: 500,
    },

    // App limits
    limits: {
      maxEventsPerUser: 10,
      maxSearchResults: 50,
      maxThreadParticipants: 20,
    },

    // Time formats
    timeFormats: {
      date: "DD MMM YYYY",
      time: "HH:mm",
      dateTime: "DD MMM YYYY, HH:mm",
    },
  },
};

export default appConfig;
