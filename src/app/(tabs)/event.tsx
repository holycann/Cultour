import Colors from "@/constants/Colors";
import { useEvent } from "@/hooks/useEvent";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function EventScreen() {
  const { events, fetchEvents, isLoading, error } = useEvent();
  const { profile } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Fetch events if not already loaded
    if (events.length === 0) {
      fetchEvents();
    }
  }, []);

  const handleCreateEvent = () => {
    // Check if user has verified identity
    // if (!profile?.identity_image_url) {
    //   Alert.alert(
    //     "Identity Verification Required",
    //     "Please verify your identity before creating an event.",
    //     [
    //       {
    //         text: "Verify Now",
    //         onPress: () => router.push("/event/verify"),
    //       },
    //       {
    //         text: "Cancel",
    //         style: "cancel",
    //       },
    //     ]
    //   );
    // } else {
      router.push("/event/add");
    // }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loadingIndicator}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || "Failed to load events"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateEvent}>
          <Text style={styles.addButtonText}>+ Create Event</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {events.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <Image
              source={{ uri: event.image_url || "" }}
              style={styles.eventImage}
            />
            <View style={styles.eventDetails}>
              <Text style={styles.eventTitle}>{event.name}</Text>
              <TouchableOpacity
                style={styles.detailButton}
                onPress={() => router.push(`/event/${event.id}`)}
              >
                <Text style={styles.detailButtonText}>See Detail</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9EFE4",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4E7D79",
  },
  addButton: {
    backgroundColor: "#EEC887",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#4E7D79",
    fontWeight: "600",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  eventCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: "100%",
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  eventDetails: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4E7D79",
    marginBottom: 15,
  },
  detailButton: {
    backgroundColor: "#EEC887",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  detailButtonText: {
    color: "#4E7D79",
    fontWeight: "600",
    fontSize: 14,
  },
});
