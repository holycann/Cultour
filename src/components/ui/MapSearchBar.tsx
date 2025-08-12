import notify from "@/services/notificationService";
import * as Location from "expo-location";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface MapSearchBarProps {
  onSearchResultSelect: (location: {
    latitude: number;
    longitude: number;
    name?: string;
  }) => void;
}

// Ambil nama lokasi dari koordinat
export const getLocationName = async (latitude: number, longitude: number) => {
  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (results.length > 0) {
      const firstResult = results[0];
      return `${firstResult.street || ""}, ${firstResult.city || ""}, ${firstResult.region || ""} ${firstResult.country || ""}`.trim();
    }
    return undefined;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    notify.error("Lokasi Error", { message: "Gagal mendapatkan nama lokasi" });
    return undefined;
  }
};

export const MapSearchBar: React.FC<MapSearchBarProps> = ({
  onSearchResultSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      latitude: number;
      longitude: number;
      name?: string;
    }[]
  >([]);

  // Fungsi pencarian lokasi yang lebih canggih
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Tambahkan "Indonesia" untuk mempersempit pencarian
      const fullQuery = `${searchQuery}, Indonesia`;

      // Gunakan geocodeAsync untuk mendapatkan lokasi
      const results = await Location.geocodeAsync(fullQuery);

      // Transform hasil pencarian ke format yang diinginkan
      const formattedResults = await Promise.all(
        results.slice(0, 10).map(async (result) => {
          const locationName = await getLocationName(
            result.latitude,
            result.longitude
          );
          return {
            latitude: result.latitude,
            longitude: result.longitude,
            name: locationName || fullQuery,
          };
        })
      );

      // Filter hasil untuk menghilangkan duplikat dan ambil 3 yang paling relevan
      const uniqueResults = formattedResults
        .filter(
          (result, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                Math.abs(t.latitude - result.latitude) < 0.01 &&
                Math.abs(t.longitude - result.longitude) < 0.01
            )
        )
        .slice(0, 3);

      if (uniqueResults.length === 0) {
        notify.info("Pencarian Lokasi", { 
          message: "Tidak ada lokasi yang ditemukan" 
        });
      }

      setSearchResults(uniqueResults);
    } catch (error) {
      console.error("Error searching location:", error);
      notify.error("Pencarian Lokasi Error", { 
        message: "Gagal mencari lokasi. Silakan coba lagi." 
      });
    }
  };

  const renderSearchResultItem = useCallback(({ item }: { item: { 
    latitude: number; 
    longitude: number; 
    name?: string; 
  } }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        onSearchResultSelect(item);
        setSearchResults([]); // Tutup dropdown
      }}
    >
      <Text style={styles.searchResultText}>{item.name}</Text>
    </TouchableOpacity>
  ), [onSearchResultSelect]);

  return (
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
          renderItem={renderSearchResultItem}
          style={styles.searchResultsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    padding: 15,
    fontSize: 16,
  },
  searchResultsList: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  searchResultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchResultText: {
    fontSize: 16,
    color: "#333",
  },
});
