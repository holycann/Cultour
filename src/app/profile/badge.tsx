import DetailHeader from "@/app/components/DetailHeader";
import { useBadge } from "@/hooks/useBadge";
import { Badge } from "@/types/Badge";
import React, { useEffect } from "react";
import { Image, ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BadgeScreen() {
  const { badges, isLoading, error, fetchBadges } = useBadge();

  useEffect(() => {
    fetchBadges();
  }, []);

  if (isLoading || error) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-[#F9EFE4]"
      >
        <Text
          className={`text-center ${error ? "text-red-500" : "text-[#4E7D79]"}`}
        >
          {error ? `Error: ${error}` : "Loading badges..."}
        </Text>
      </SafeAreaView>
    );
  }

  // Separate my badges and available badges
  const myBadges: Badge[] = badges.filter(
    (badge) => badge.name === "Explorer" || badge.name === "Warlok"
  );
  const availableBadges: Badge[] = badges.filter(
    (badge) => badge.name !== "Explorer" && badge.name !== "Warlok"
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      {/* Custom Header */}
      <DetailHeader title="Badges" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Badges Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-[#1E1E1E] mb-4">
            My Badges
          </Text>
          <View
            className="bg-[#F9EFE4] rounded-xl p-4 flex-row flex-wrap justify-between"
            style={shadowStyle}
          >
            {myBadges.length > 0 ? (
              myBadges.map((badge) => (
                <View key={badge.id} className="items-center w-[45%] mb-4">
                  <Image
                    source={{ uri: badge.icon_url }}
                    className="w-32 h-32"
                    resizeMode="contain"
                  />
                  <Text className="mt-2 text-base font-bold text-[#4E7D79] text-center">
                    {badge.name}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-[#4E7D79] text-center w-full">
                No badges earned yet
              </Text>
            )}
          </View>
        </View>

        {/* Available Badges Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-[#1E1E1E] mb-4">
            Available Badges
          </Text>
          <View
            className="bg-white rounded-xl p-4 flex-row flex-wrap justify-between"
            style={shadowStyle}
          >
            {availableBadges.length > 0 ? (
              availableBadges.map((badge) => (
                <View
                  key={badge.id}
                  className="items-center w-[45%] mb-4 opacity-50"
                >
                  <Image
                    source={{ uri: badge.icon_url }}
                    className="w-32 h-32"
                    resizeMode="contain"
                  />
                  <Text className="mt-2 text-base font-bold text-[#4E7D79] text-center">
                    {badge.name}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-[#4E7D79] text-center w-full">
                No additional badges available
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
};
