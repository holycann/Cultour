import Colors from "@/constants/Colors";
import { useSearch } from "@/hooks/useSearch";
import { SearchResult } from "@/types/Search";
import { debounce } from "@/utils/debounce";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SearchBarProps = {
  placeholder?: string;
};

export default function SearchBar({
  placeholder = "Search events, cities, places...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { searchResults, performSearch, isSearching, error, clearSearch } =
    useSearch();

  // Debounced search function to reduce unnecessary API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 2) {
        performSearch({
          query: searchQuery,
          limit: 5,
          types: ["event", "city", "province", "location"],
        });
      } else {
        clearSearch();
      }
    }, 300),
    [performSearch, clearSearch]
  );

  // Trigger search as user types
  useEffect(() => {
    debouncedSearch(query);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case "event":
        router.push(`/event/${result.data.id}`);
        break;
      case "city":
        router.push(`/place/${result.data.id}`);
        break;
      case "province":
        router.push(`/place/${result.data.id}`);
        break;
      case "location":
        router.push(`/place/${result.data.id}`);
        break;
    }
    clearSearch();
    setQuery("");
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => {
    const getName = () => {
      switch (item.type) {
        case "event":
          return (item.data as any).name;
        case "city":
          return (item.data as any).name;
        case "province":
          return (item.data as any).name;
        case "location":
          return (item.data as any).name;
        default:
          return "Unknown";
      }
    };

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => handleResultPress(item)}
      >
        <Text style={styles.resultText}>{getName()}</Text>
        <Text style={styles.resultType}>{item.type}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => router.replace("/(tabs)")}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          className="h-4 w-4"
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {query.length >= 2 && searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={searchResults.slice(0, 5)} // Limit to 5 results
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `${item.type}-${index}`}
            style={styles.resultsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "relative", // For absolute positioning of results
  },
  iconContainer: {
    marginRight: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 100,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  resultsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: "white",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1000, // Ensure results are above other elements
  },
  resultsList: {
    paddingHorizontal: 15,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultText: {
    fontSize: 16,
    color: Colors.black,
  },
  resultType: {
    fontSize: 12,
    color: Colors.secondary,
    textTransform: "capitalize",
  },
});
