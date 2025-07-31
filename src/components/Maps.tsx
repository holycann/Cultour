import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";

// Import type for City
import { City } from "@/types/City";

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
  const getCityCoordinates = async (city: City): Promise<{ latitude: number; longitude: number; name: string } | null> => {
    try {
      // Coba geocode nama kota
      const results = await Location.geocodeAsync(`${city.name}, Indonesia`);
      
      if (results.length > 0) {
        const firstResult = results[0];
        const locationName = await getLocationName(firstResult.latitude, firstResult.longitude);
        
        return {
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
          name: locationName || city.name
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting city coordinates:", error);
      return null;
    }
  };
  
  // Fungsi pencarian lokasi yang lebih canggih
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Tambahkan "Indonesia" untuk mempersempit pencarian
      const fullQuery = `${searchQuery}, Indonesia`;
      
      // Gunakan geocodeAsync untuk mendapatkan lokasi
      const results = await Location.geocodeAsync(fullQuery);
      
      // Transform hasil pencarian ke format yang diinginkan
      const formattedResults = await Promise.all(results.slice(0, 10).map(async result => {
        const locationName = await getLocationName(result.latitude, result.longitude);
        return {
          latitude: result.latitude,
          longitude: result.longitude,
          name: locationName || fullQuery,
        };
      }));

      // Filter hasil untuk menghilangkan duplikat dan ambil 3 yang paling relevan
      const uniqueResults = formattedResults.filter((result, index, self) => 
        index === self.findIndex((t) => (
          Math.abs(t.latitude - result.latitude) < 0.01 && 
          Math.abs(t.longitude - result.longitude) < 0.01
        ))
      ).slice(0, 3);

      setSearchResults(uniqueResults);
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
        return `${firstResult.street || ''}, ${firstResult.city || ''}, ${firstResult.region || ''} ${firstResult.country || ''}`.trim();
      }
      return undefined;
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return undefined;
    }
  };

  // Tentukan initial region
  const getInitialRegion = async (): Promise<Region> => {
    // Prioritaskan lokasi yang baru disimpan
    if (previousLocation && previousLocation.latitude && previousLocation.longitude) {
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

  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name?: string;
  } | null>(previousLocation || null);

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
        name: locationName
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
        name: locationName
      };

      setSelectedLocation(selectedLocationData);
      onLocationSelect && onLocationSelect(selectedLocationData);
      onClose && onClose();
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Gagal mendapatkan lokasi");
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
        name: locationName
      });
    } else {
      Alert.alert("Error", "Lokasi saat ini tidak tersedia");
    }
  };

  // Render input pencarian dan hasil
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Cari lokasi di Indonesia..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          // Pencarian otomatis saat mengetik
          if (text.length > 2) {
            searchLocation();
          } else {
            setSearchResults([]);
          }
        }}
      />
      
      {/* Dropdown hasil pencarian */}
      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.searchResultItem}
              onPress={() => {
                // Pindahkan peta ke lokasi yang dipilih
                const newRegion = {
                  latitude: item.latitude,
                  longitude: item.longitude,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                };

                setRegion(newRegion);
                setSearchResults([]); // Tutup dropdown
              }}
            >
              <Text style={styles.searchResultText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          style={styles.searchResultsList}
        />
      )}
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
        showsUserLocation={locationPermission === Location.PermissionStatus.GRANTED}
        showsMyLocationButton={false}
        scrollEnabled={isFullScreen}
        zoomEnabled={isFullScreen}
      />
      
      {/* Marker tetap di tengah layar */}
      {isFullScreen && (
        <View style={styles.markerFixed}>
          <Ionicons name="pin" size={40} color="#4E7D79" />
        </View>
      )}
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
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.fullScreenMap}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={locationPermission === Location.PermissionStatus.GRANTED}
            showsMyLocationButton={false}
            scrollEnabled={isFullScreen}
            zoomEnabled={isFullScreen}
          />

          {/* Marker tetap di tengah layar */}
          <View style={styles.markerFixed}>
            <Ionicons name="pin" size={40} color="#4E7D79" />
          </View>

          {/* Search Bar */}
          {renderSearchBar()}
          
          {/* Tombol Reset dan Simpan */}
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetToMyLocation}
            >
              <Ionicons name="locate" size={24} color="#4E7D79" />
              <Text style={styles.actionButtonText}>My Location</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={saveSelectedLocation}
            >
              <Ionicons name="save" size={24} color="white" style={{ marginRight: 10 }} />
              <Text style={{ color: "white", marginLeft: 10 }}>Save</Text>
            </TouchableOpacity>
          </View>
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
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    padding: 15,
    fontSize: 16,
  },
  searchButton: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  searchResultsList: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
  },
  actionButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resetButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  saveButton: {
    backgroundColor: '#4E7D79',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  actionButtonText: {
    marginLeft: 10,
    color: '#4E7D79',
    fontWeight: 'bold',
  },
  markerFixed: {
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
    position: 'absolute',
    top: '50%',
  },
});

export default Maps;
