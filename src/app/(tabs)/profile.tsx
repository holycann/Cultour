import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileIndexScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { profile, isLoading, error } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9EFE4] justify-center items-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9EFE4] justify-center items-center">
        <Text className="text-red-500 text-center">
          {error || "Failed to load profile"}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9EFE4]">
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      {/* Top Header with curve */}
      <View className="bg-[#EEC887] pt-10 pb-6 rounded-b-3xl items-center">
        <Text className="text-2xl font-bold text-[#1E1E1E]">Profile</Text>
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
        <View className="space-y-4 mb-8">
          {/* Edit Profile */}
          <TouchableOpacity
            onPress={() => router.push("/profile/edit")}
            className="bg-white rounded-xl px-4 py-4 border border-[#E0E0E0] flex-row items-center justify-between"
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
            className={`rounded-xl px-4 py-4 border flex-row items-center justify-between ${
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
            className="bg-white rounded-xl px-4 py-4 border border-[#E0E0E0] flex-row items-center justify-between"
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
            className="bg-white rounded-xl px-4 py-4 border border-[#FBCACA] flex-row items-center justify-between"
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
