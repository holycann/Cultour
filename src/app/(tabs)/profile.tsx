import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Icon } from "@iconify/react";
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
  View
} from "react-native";

export default function ProfileIndexScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { 
    profile, 
    isLoading, 
    error 
  } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F9EFE4] justify-center items-center">
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
        />
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
      
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 24, 
          paddingTop: 24 
        }}
      >
        <View className="items-center mb-8">
          <Text className="text-xl font-bold text-[#4E7D79]">
            Profile
          </Text>
        </View>

        {/* Profile Header */}
        <View className="items-center mb-8">
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
          
          <Text className="text-lg font-bold text-[#4E7D79]">
            {profile?.fullname || "Penjelajah"}
          </Text>
          <Text className="text-[#4E7D79] opacity-70">
            {user?.email || "-"}
          </Text>
        </View>

        {/* Profile Actions */}
        <View className="space-y-4">
          {/* Edit Profile */}
          <TouchableOpacity 
            onPress={() => router.push("/profile/edit")}
            className="flex-row items-center justify-between bg-white px-4 py-3 rounded-xl"
          >
            <View className="flex-row items-center">
              <Icon 
                icon="mdi:account-edit" 
                width={24} 
                height={24} 
                color="#4E7D79" 
              />
              <Text className="ml-4 text-[#4E7D79]">Edit Profile</Text>
            </View>
            <Icon 
              icon="mdi:chevron-right" 
              width={24} 
              height={24} 
              color="#4E7D79" 
            />
          </TouchableOpacity>

          {/* Identity Verification */}
          <TouchableOpacity 
            onPress={() => router.push("/profile/verify")}
            className="flex-row items-center justify-between bg-white px-4 py-3 rounded-xl"
          >
            <View className="flex-row items-center">
              <Icon 
                icon={
                  profile?.identity_image_url 
                    ? "mdi:check-circle" 
                    : "mdi:alert-circle"
                } 
                width={24} 
                height={24} 
                color={
                  profile?.identity_image_url 
                    ? "#4E7D79" 
                    : "#D32F2F"
                } 
              />
              <Text 
                className={`ml-4 ${
                  profile?.identity_image_url 
                    ? 'text-[#4E7D79]' 
                    : 'text-[#D32F2F]'
                }`}
              >
                {profile?.identity_image_url 
                  ? "Identity Verified" 
                  : "Verify Identity"}
              </Text>
            </View>
            <Icon 
              icon="mdi:chevron-right" 
              width={24} 
              height={24} 
              color={
                profile?.identity_image_url 
                  ? "#4E7D79" 
                  : "#D32F2F"
              } 
            />
          </TouchableOpacity>

          {/* Badge */}
          <TouchableOpacity 
            onPress={() => router.push("/profile/badge")}
            className="flex-row items-center justify-between bg-white px-4 py-3 rounded-xl"
          >
            <View className="flex-row items-center">
              <Icon 
                icon="mdi:medal" 
                width={24} 
                height={24} 
                color="#4E7D79" 
              />
              <Text className="ml-4 text-[#4E7D79]">Badge</Text>
            </View>
            <Icon 
              icon="mdi:chevron-right" 
              width={24} 
              height={24} 
              color="#4E7D79" 
            />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-between bg-white px-4 py-3 rounded-xl"
          >
            <View className="flex-row items-center">
              <Icon 
                icon="mdi:logout" 
                width={24} 
                height={24} 
                color="#D32F2F" 
              />
              <Text className="ml-4 text-[#D32F2F]">Logout</Text>
            </View>
            <Icon 
              icon="mdi:chevron-right" 
              width={24} 
              height={24} 
              color="#D32F2F" 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}