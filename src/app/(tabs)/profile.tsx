import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileIndexScreen() {
  const router = useRouter();
  const { user, logout, isLoading: userLoading } = useAuth();
  const { profile, isLoading } = useUser();

  useEffect(() => {
    if (!user) {
      Alert.alert("Error", "Please Login First For Access Your Profile", [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ]);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading || userLoading) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-[#F9EFE4] justify-center items-center"
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9EFE4]" edges={["left", "right"]}>
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      {/* Top Header with curve */}
      <View className="bg-[#EEC887] pt-10 pb-6 rounded-b-3xl items-center w-full">
        <Text className="text-xl md:text-2xl font-bold text-[#1E1E1E]">
          Profile
        </Text>
      </View>

      {/* White content area */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        className="bg-white rounded-t-3xl -mt-4 px-6 pt-6"
      >
        {/* Avatar & Name */}
        <View className="items-center mb-6">
          <View className="w-32 h-32 rounded-full bg-[#E0E0E0] items-center justify-center mb-4">
            <Image
              source={
                profile?.avatar_url
                  ? { uri: profile.avatar_url }
                  : require("@/assets/images/eksproler.png")
              }
              className="w-28 h-28 rounded-full"
              resizeMode="cover"
            />
          </View>
          <Text className="text-lg font-bold text-[#1E1E1E]">
            {profile?.fullname || "Penjelajah"}
          </Text>
          <Text className="text-[#4E7D79] opacity-70">
            {user?.email || "-"}
          </Text>
        </View>

        {/* Profile Menu List */}
        <View className="mb-8">
          {/* Edit Profile */}
          <TouchableOpacity
            onPress={() => router.push("/profile/edit")}
            className="bg-white rounded-xl px-4 py-4 border-b border-black flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={22} color="#4E7D79" />
              <Text className="ml-4 text-[#4E7D79] font-semibold">
                Edit Profile
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#4E7D79" />
          </TouchableOpacity>

          {/* Identity Verification */}
          <TouchableOpacity
            onPress={() => router.push("/profile/verify")}
            className={`rounded-xl px-4 py-4 border-b border-black flex-row items-center justify-between ${
              profile?.identity_image_url
                ? "bg-white border-[#E0E0E0]"
                : "bg-white border-[#FBCACA]"
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={
                  profile?.identity_image_url
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={22}
                color={profile?.identity_image_url ? "#4E7D79" : "#D32F2F"}
              />
              <Text
                className={`ml-4 font-semibold ${
                  profile?.identity_image_url
                    ? "text-[#4E7D79]"
                    : "text-[#D32F2F]"
                }`}
              >
                {profile?.identity_image_url
                  ? "Identity Verified"
                  : "Verify Identity"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={profile?.identity_image_url ? "#4E7D79" : "#D32F2F"}
            />
          </TouchableOpacity>

          {/* Badge */}
          <TouchableOpacity
            onPress={() => router.push("/profile/badge")}
            className="bg-white rounded-xl px-4 py-4 border-b border-black flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="medal" size={22} color="#4E7D79" />
              <Text className="ml-4 text-[#4E7D79] font-semibold">Badge</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#4E7D79" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-xl px-4 py-4 border-b border-black flex-row items-center justify-between"
          >
            <View className="flex-row items-center">
              <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
              <Text className="ml-4 text-[#D32F2F] font-semibold">Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
