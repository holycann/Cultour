import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";

// Import type for City
import { City } from "@/types/City";

// Import atomic components
import { MapActionButtons } from "@/components/ui/MapActionButtons";
import { MapMarker } from "@/components/ui/MapMarker";
import { MapSearchBar, getLocationName } from "@/components/ui/MapSearchBar";
import notify from "@/services/notificationService";

interface MapsProps {
  initialLatitude?: number;
  initialLongitude?: number;
  previousLocation?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  initialCity?: City;
  onLocationSelect?: (location: {
    latitude: number;
    longitude: number;
    name?: string;
  }) => void;
  isFullScreen?: boolean;
  onClose?: () => void;
}

const Maps: React.FC<MapsProps> = ({
  initialLatitude = -0.7893, // Default ke Indonesia
  initialLongitude = 113.9213,
  previousLocation,
  initialCity,
  onLocationSelect,
  isFullScreen = false,
  onClose,
}) => {
  const mapRef = useRef<MapView>(null);

  // Fungsi untuk mendapatkan koordinat kota
  const getCityCoordinates = async (
    city: City
  ): Promise<{ latitude: number; longitude: number; name: string } | null> => {
    try {
      // Coba geocode nama kota
      const results = await Location.geocodeAsync(`${city.name}, Indonesia`);

      if (results.length > 0) {
        const firstResult = results[0];
        const locationName = await getLocationName(
          firstResult.latitude,
          firstResult.longitude
        );

        return {
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
          name: locationName || city.name,
        };
      }

      return null;
    } catch (error) {
      console.error("Error getting city coordinates:", error);
      return null;
    }
  };

  // Tentukan initial region
  const getInitialRegion = async (): Promise<Region> => {
    // Prioritaskan lokasi yang baru disimpan
    if (
      previousLocation &&
      previousLocation.latitude &&
      previousLocation.longitude
    ) {
      return {
        latitude: previousLocation.latitude,
        longitude: previousLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Jika ada lokasi dari kota yang dipilih, coba dapatkan koordinatnya
    if (initialCity) {
      const cityCoordinates = await getCityCoordinates(initialCity);

      if (cityCoordinates) {
        return {
          latitude: cityCoordinates.latitude,
          longitude: cityCoordinates.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
      }
    }

    // Jika tidak ada lokasi sebelumnya, gunakan lokasi default atau current location
    return {
      latitude: initialLatitude,
      longitude: initialLongitude,
      latitudeDelta: 10, // Cakupan peta Indonesia
      longitudeDelta: 10,
    };
  };

  const [region, setRegion] = useState<Region>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 10,
    longitudeDelta: 10,
  });

  const [locationPermission, setLocationPermission] =
    useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
  } | null>(previousLocation || null);

  // Minta izin lokasi dan dapatkan lokasi saat ini
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      // Tentukan initial region
      const initialRegion = await getInitialRegion();
      setRegion(initialRegion);

      // Set lokasi terpilih sesuai initial region
      const locationName = await getLocationName(
        initialRegion.latitude,
        initialRegion.longitude
      );

      setSelectedLocation({
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
        name: locationName,
      });

      // Simpan lokasi saat ini jika permission diizinkan
      if (status === Location.PermissionStatus.GRANTED) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setCurrentLocation(location);
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  // Minta izin lokasi saat komponen dimuat
  useEffect(() => {
    const initializeLocation = async () => {
      await requestLocationPermission();
    };

    initializeLocation();
  }, []);

  // Simpan lokasi yang dipilih (lokasi di tengah layar)
  const saveSelectedLocation = async () => {
    try {
      // Gunakan koordinat tengah region saat ini
      const locationName = await getLocationName(
        region.latitude,
        region.longitude
      );

      const selectedLocationData = {
        latitude: region.latitude,
        longitude: region.longitude,
        name: locationName,
      };

      setSelectedLocation(selectedLocationData);
      onLocationSelect && onLocationSelect(selectedLocationData);
      onClose && onClose();
    } catch (error) {
      console.error("Error getting location:", error);
      notify.error("Error", { message: "Gagal mendapatkan lokasi" });
    }
  };

  // Reset ke lokasi saat ini (my location)
  const resetToMyLocation = async () => {
    if (currentLocation) {
      const locationName = await getLocationName(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      const currentRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

      setRegion(currentRegion);

      setSelectedLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        name: locationName,
      });
    } else {
      notify.info("Info", { message: "Lokasi saat ini tidak tersedia" });
    }
  };

  // Render konten peta
  const renderMapContent = () => (
    <>
      <MapSearchBar
        onSearchResultSelect={(location) => {
          const newRegion = {
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          };

          setRegion(newRegion);
        }}
      />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={isFullScreen ? styles.fullScreenMap : styles.previewMap}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={
          locationPermission === Location.PermissionStatus.GRANTED
        }
        showsMyLocationButton={false}
        scrollEnabled={isFullScreen}
        zoomEnabled={isFullScreen}
      />

      {/* Marker tetap di tengah layar */}
      {isFullScreen && <MapMarker />}
    </>
  );

  // Render dalam mode full screen atau preview
  if (isFullScreen) {
    return (
      <Modal visible={true} animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.fullScreenContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.fullScreenMap}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={
              locationPermission === Location.PermissionStatus.GRANTED
            }
            showsMyLocationButton={false}
            scrollEnabled={isFullScreen}
            zoomEnabled={isFullScreen}
          />

          {/* Marker tetap di tengah layar */}
          <MapMarker />

          {/* Search Bar */}
          <MapSearchBar
            onSearchResultSelect={(location) => {
              const newRegion = {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              };

              setRegion(newRegion);
            }}
          />

          {/* Tombol Reset dan Simpan */}
          <MapActionButtons
            onResetLocation={resetToMyLocation}
            onSaveLocation={saveSelectedLocation}
          />
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // Mode preview
  return (
    <TouchableOpacity
      style={styles.previewContainer}
      onPress={() =>
        onLocationSelect &&
        onLocationSelect(
          selectedLocation || {
            latitude: initialLatitude,
            longitude: initialLongitude,
          }
        )
      }
    >
      {renderMapContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  previewContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  fullScreenMap: {
    flex: 1,
  },
  previewMap: {
    width: Dimensions.get("window").width - 32,
    height: 200,
  },
});

export default Maps;
