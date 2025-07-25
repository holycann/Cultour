import { Icon } from "@iconify/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function ProfileIndexScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<null | {
    avatar_url: string;
    bio: string;
    fullname: string;
    user_id: string;
  }>(null);
  const [badge, setBadge] = useState<"guest" | "warlok">("guest");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setBadge("guest");
        return;
      }

      const res = await axios.get("http://localhost:8181/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setProfile(res.data);
        setBadge("warlok");
      }
    } catch (err) {
      console.error("Gagal mengambil profil:", err);
      setBadge("guest");
    }
  };

  return (
    <View className="flex-1 bg-[#F9EFE4] px-6 pt-6">
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      <Text className="text-xl font-bold text-[#4E7D79] text-center mb-6">
        My Profile
      </Text>

      {/* Avatar */}
      <View className="items-center mb-4">
        <Image
          source={
            profile?.avatar_url
              ? { uri: profile.avatar_url }
              : require("../../../assets/images/eksproler.png")
          }
          className="w-32 h-32 rounded-full"
          resizeMode="cover"
        />
      </View>

      {/* Info */}
      <View className="items-center mb-4">
        <Text className="text-lg font-bold text-[#4E7D79]">
          {profile?.fullname || "Penjelajah"}
        </Text>
        <Text className="text-[#4E7D79] mb-2">{profile?.user_id || "-"}</Text>
        <Text className="text-center text-[#4E7D79] italic">{profile?.bio || "Belum ada bio."}</Text>
      </View>

      {/* Badge */}
      <View className="items-center mt-4 mb-6">
        <Text className="text-sm text-white px-4 py-1 rounded-full bg-[#4E7D79]">
          {badge === "guest" ? "Guest" : "Warlok"}
        </Text>
      </View>

      {/* Aksi */}
      <TouchableOpacity
        onPress={() => router.push("/dashboard/profile/(tab)/edit")}
        className="bg-white px-4 py-4 rounded-xl flex-row justify-between items-center"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center">
          <Icon icon="mdi:account-edit" width={24} height={24} color="#4E7D79" />
          <Text className="ml-4 text-[#4E7D79]">Edit Profile</Text>
        </View>
        <Icon icon="mdi:chevron-right" width={24} height={24} color="#4E7D79" />
      </TouchableOpacity>
    </View>
  );
}
