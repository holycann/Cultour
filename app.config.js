import 'dotenv/config';

export default {
  expo: {
    name: "Cultour",
    slug: "cultour",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./src/assets/images/icon.png",
    scheme: "cultour",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./src/assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Kami membutuhkan akses lokasi Anda untuk menampilkan peta dan fitur lokasi",
        NSLocationAlwaysAndWhenInUseUsageDescription: "Kami membutuhkan akses lokasi Anda untuk menampilkan peta dan fitur lokasi"
      }
    },
    android: {
      package: "com.indonesian.cultour",
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    web: {
      favicon: "./src/assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Kami membutuhkan akses lokasi Anda untuk menampilkan peta dan fitur lokasi"
        }
      ]
    ],
    extra: {
      router: {
        origin: false
      }
    },
    experiments: {
      tsconfigPaths: true
    }
  }
};