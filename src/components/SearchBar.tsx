import Colors from "@/constants/Colors";
import { useSearch } from "@/hooks/useSearch";
import notify from "@/services/notificationService";
import { SearchResult } from "@/types/Search";
import { debounce } from "@/utils/debounce";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SearchBarProps = {
  placeholder?: string;
};

// Helper function to convert error to string
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred during search";
};

export default function SearchBar({
  placeholder = "Search events, cities, places...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const { searchResults, performSearch, isSearching, error, clearSearch } =
    useSearch();

  // Handle error display
  useEffect(() => {
    if (error) {
      const errorStr = getErrorMessage(error);
      notify.error("Search Error", { message: errorStr });
    }
  }, [error]);

  // Debounced search function to reduce unnecessary API calls
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.length >= 2) {
        performSearch(
          {
            query: searchQuery,
            types: ["event", "place"],
          },
          {
            pagination: { per_page: 5 },
          }
        );
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

  const handleResultPress = useCallback(
    (result: SearchResult) => {
      switch (result.type) {
        case "event":
          router.push(`/event/${(result.data as any).id}`);
          break;
        case "place":
          router.push(`/place/${(result.data as any).id}`);
          break;
      }
      clearSearch();
      setQuery("");
    },
    [router, clearSearch, setQuery]
  );

  const renderSearchResult = useCallback(
    ({ item }: { item: SearchResult }) => {
      const getName = () => {
        switch (item.type) {
          case "event":
            return (item.data as any).name;
          case "place":
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
    },
    [handleResultPress]
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => router.replace("/(tabs)")}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{
            height: 40,
            width: 40
          }}
          placeholder={require("@/assets/images/adaptive-icon.png")}
          contentFit="contain"
          transition={300}
          priority="low"
          recyclingKey="search-bar-logo"
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
        {isSearching && (
          <ActivityIndicator 
            size="small" 
            color={Colors.primary} 
            style={styles.searchingIndicator} 
          />
        )}
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
    paddingVertical: 20,
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
    height: 40,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
  },
  searchingIndicator: {
    marginLeft: 10,
  },
  resultsContainer: {
    position: "absolute",
    top: 65,
    left: 15,
    right: 15,
    maxHeight: 200,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
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
