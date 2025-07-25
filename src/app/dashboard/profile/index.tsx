import { Icon } from "@iconify/react";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { authService } from "../../../api/services/authService";
import { userService } from "../../../api/services/userService";

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getCurrentProfile();
      if (response.success && response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
    }
  };

  const handleEditProfile = () => {
    router.push('/dashboard/profile/(tab)/edit'); // Ganti ke '/profile/(tab)/edit' jika file edit.tsx yang ingin dibuka
  };

  const handleBadges = () => {
    router.push('/dashboard/profile/(tab)/badge'); // Pastikan ada file badges.tsx di folder tsb
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      await SecureStore.deleteItemAsync('auth_token');
      router.replace("/auth/login");
    } catch (error) {
      console.error("Gagal logout:", error);
      Alert.alert("Error", "Gagal keluar dari akun");
    }
  };

  return (
    <View 
      className="flex-1" 
      style={{ backgroundColor: '#F9EFE4' }}
    >
      <StatusBar 
        backgroundColor="#F9EFE4" 
        barStyle="dark-content" 
      />

      {/* Header */}
      <View className="p-4">
        <Text className="text-xl font-bold text-[#4E7D79] text-center">Profile</Text>
      </View>

      <View className="flex-1 items-center px-6 pt-8">
        {/* Foto Profil */}
        <View 
          className="w-40 h-40 rounded-full justify-center items-center mb-6"
          style={{ 
            backgroundColor: 'white',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Image 
            source={require('../../../assets/images/logoSplash.png')}
            className="w-32 h-32 rounded-full"
            resizeMode="contain"
          />
        </View>

        {/* Informasi Pengguna */}
        <Text className="text-xl font-bold text-[#4E7D79] mb-2">
          {userProfile?.name || 'Penjelajah'}
        </Text>
        <Text className="text-[#4E7D79] mb-8">
          {userProfile?.email || 'you@example.com'}
        </Text>

        {/* Menu Profil */}
        <View className="w-full">
          <TouchableOpacity 
            onPress={handleEditProfile}
            className="flex-row items-center justify-between bg-white rounded-xl px-4 py-4 mb-4"
            style={{ 
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
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

          <TouchableOpacity 
            onPress={handleBadges}
            className="flex-row items-center justify-between bg-white rounded-xl px-4 py-4 mb-4"
            style={{ 
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              <Icon 
                icon="mdi:trophy" 
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

          <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-between bg-white rounded-xl px-4 py-4"
            style={{ 
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center">
              <Icon 
                icon="mdi:logout" 
                width={24} 
                height={24} 
                color="#4E7D79" 
              />
              <Text className="ml-4 text-[#4E7D79]">Logout</Text>
            </View>
            <Icon 
              icon="mdi:chevron-right" 
              width={24} 
              height={24} 
              color="#4E7D79" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
