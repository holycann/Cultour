import notify from "@/services/notificationService";
import { UserProfile } from "@/types/UserProfile";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface ProfileMenuListProps {
  profile: UserProfile | null;
  onLogout: () => void;
}

export function ProfileMenuList({ profile, onLogout }: ProfileMenuListProps) {
  const router = useRouter();

  const handleLogout = () => {
    notify.dialog("Logout", {
      message: "Are you sure you want to log out?",
      confirmText: "Logout",
      cancelText: "Cancel",
      onConfirm: () => {
        try {
          onLogout();
        } catch (error) {
          console.error("Logout error:", error);
          notify.error("Logout Failed", {
            message: "Unable to log out. Please try again.",
          });
        }
      },
    });
  };

  const menuItems = [
    {
      icon: "person-outline",
      title: "Edit Profile",
      onPress: () => router.push("/profile/edit"),
      color: "#4E7D79",
    },
    {
      icon: profile?.identity_image_url ? "checkmark-circle" : "alert-circle",
      title: profile?.identity_image_url
        ? "Identity Verified"
        : "Verify Identity",
      onPress: () => router.push("/profile/verify"),
      color: profile?.identity_image_url ? "#4E7D79" : "#D32F2F",
      textColor: profile?.identity_image_url
        ? "text-[#4E7D79]"
        : "text-[#D32F2F]",
    },
    {
      icon: "medal",
      title: "Badge",
      onPress: () => router.push("/profile/badge"),
      color: "#4E7D79",
    },
    {
      icon: "log-out-outline",
      title: "Logout",
      onPress: handleLogout,
      color: "#D32F2F",
    },
  ];

  return (
    <View className="mb-8">
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={item.title}
          onPress={item.onPress}
          className={`bg-white rounded-xl px-4 py-4 ${
            index < menuItems.length - 1 ? "border-b border-black" : ""
          } flex-row items-center justify-between`}
        >
          <View className="flex-row items-center">
            <Ionicons name={item.icon as any} size={22} color={item.color} />
            <Text
              className={`ml-4 font-semibold ${
                item.textColor || `text-[${item.color}]`
              }`}
            >
              {item.title}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={item.color} />
        </TouchableOpacity>
      ))}
    </View>
  );
}