import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import MapView, {
    MapPressEvent,
    Marker,
    PROVIDER_GOOGLE,
    Region,
} from "react-native-maps";

interface MapsProps {
  initialLatitude?: number;
  initialLongitude?: number;
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
  onLocationSelect,
  isFullScreen = false,
  onClose,
}) => {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>({
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 10, // Cakupan peta Indonesia
    longitudeDelta: 10,
  });

  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
  }[]>([]);

  // Minta izin lokasi dan dapatkan lokasi saat ini
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);

      if (status === Location.PermissionStatus.GRANTED) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setCurrentLocation(location);
        
        // Update region ke lokasi saat ini
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  // Cari lokasi berdasarkan query
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Gunakan geocodeAsync untuk mendapatkan lokasi
      const results = await Location.geocodeAsync(searchQuery);
      
      // Transform hasil pencarian ke format yang diinginkan
      const formattedResults = results.map(result => ({
        latitude: result.latitude,
        longitude: result.longitude,
        name: searchQuery, // Gunakan query pencarian sebagai nama
      }));

      setSearchResults(formattedResults);

      if (formattedResults.length > 0) {
        const firstResult = formattedResults[0];
        
        // Pindahkan peta ke lokasi pertama
        mapRef.current?.animateToRegion({
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });

        // Set lokasi terpilih
        setSelectedLocation(firstResult);

        // Panggil callback jika disediakan
        onLocationSelect && onLocationSelect(firstResult);
      } else {
        Alert.alert("Pencarian", "Lokasi tidak ditemukan");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      Alert.alert("Error", "Gagal mencari lokasi");
    }
  };

  // Ambil nama lokasi dari koordinat
  const getLocationName = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ 
        latitude, 
        longitude 
      });

      if (results.length > 0) {
        const firstResult = results[0];
        return `${firstResult.street || ''}, ${firstResult.city || ''}, ${firstResult.region || ''}`.trim();
      }
      return undefined;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return undefined;
    }
  };

  // Tangani pemilihan lokasi
  const handleLocationSelect = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    
    // Update region
    setRegion(prevRegion => ({
      ...prevRegion,
      latitude,
      longitude,
    }));

    // Dapatkan nama lokasi
    const locationName = await getLocationName(latitude, longitude);

    const selectedLocationData = {
      latitude,
      longitude,
      name: locationName,
    };

    setSelectedLocation(selectedLocationData);

    // Panggil callback jika disediakan
    onLocationSelect && onLocationSelect(selectedLocationData);
  };

  // Minta izin lokasi saat komponen dimuat
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Render input pencarian dan hasil
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Cari lokasi..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={searchLocation}
      />
      <TouchableOpacity onPress={searchLocation} style={styles.searchButton}>
        <Ionicons name="search" size={24} color="#4E7D79" />
      </TouchableOpacity>
    </View>
  );

  // Render konten peta
  const renderMapContent = () => (
    <>
      {renderSearchBar()}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={isFullScreen ? styles.fullScreenMap : styles.previewMap}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleLocationSelect}
        showsUserLocation={locationPermission === Location.PermissionStatus.GRANTED}
        showsMyLocationButton={true}
      >
        {/* Marker lokasi terpilih */}
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Lokasi Terpilih"
            description={selectedLocation.name}
            draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              handleLocationSelect({
                nativeEvent: { coordinate: { latitude, longitude } }
              } as MapPressEvent);
            }}
          />
        )}
      </MapView>
    </>
  );

  // Render dalam mode full screen atau preview
  if (isFullScreen) {
    return (
      <Modal 
        visible={true} 
        animationType="slide"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView 
          style={styles.fullScreenContainer} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {renderMapContent()}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  // Mode preview
  return (
    <TouchableOpacity 
      style={styles.previewContainer}
      onPress={() => onLocationSelect && onLocationSelect(selectedLocation || {
        latitude: initialLatitude,
        longitude: initialLongitude,
      })}
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
    marginVertical: 10,
  },
  previewMap: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  fullScreenMap: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  searchContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    paddingRight: 40,
  },
  searchButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Maps;
