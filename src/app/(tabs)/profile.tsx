import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import notify from "@/services/notificationService";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileHeader } from "./_components/ProfileHeader";
import { ProfileMenuList } from "./_components/ProfileMenuList";

export default function ProfileIndexScreen() {
  const router = useRouter();
  const { user, logout, isLoading: userLoading } = useAuth();
  const { profile, fetchUserProfile, isLoading } = useUser();

  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = async () => {
    try {
      setRefreshing(true);
      if (user) {
        await fetchUserProfile(user.id);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      notify.dialog("Error", {
        message: "Please Login First For Access Your Profile",
        confirmText: "Go to Login",
        onConfirm: () => router.replace("/auth/login"),
      });
    } else {
      loadProfile();
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
      <LoadingScreen message="Loading profile..." backgroundColor="[#F9EFE4]" />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadProfile}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Avatar & Name */}
        <ProfileHeader profile={profile} user={user} />

        {/* Profile Menu List */}
        <ProfileMenuList profile={profile} onLogout={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}
