import { Icon } from "@iconify/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useGlobalNotification } from "../../../../modules/GlobalNotificationWrapper";

export default function EditProfileScreen() {
  const router = useRouter();
  const { showNotification } = useGlobalNotification();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get("http://localhost:8181/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data) {
        setFullname(res.data.fullname || "");
        setBio(res.data.bio || "");
        setProfileImage(res.data.avatar_url || null);
        setProfileId(res.data.id); // <-- ambil profile id
      }
    } catch (error) {
      console.error("Gagal mengambil profil:", error);
      showNotification({
        type: "error",
        message: "Gagal memuat data profil",
      });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // TODO: Upload ke Supabase Storage lalu simpan URL-nya
    }
  };

  const handleSave = () => {
    showNotification({
      type: "warning",
      title: "Simpan Perubahan?",
      message: "Apakah Anda yakin ingin menyimpan perubahan profil?",
      onCancel: () => console.log("Batal"),
      onConfirm: async () => {
        try {
          if (!profileId) {
            showNotification({
              type: "error",
              message: "ID profil tidak ditemukan.",
            });
            return;
          }

          const token = await AsyncStorage.getItem("authToken");

          const updateData = {
            fullname,
            bio,
            avatar_url: profileImage,
          };

          const res = await axios.put(
            `http://localhost:8181/profile/${profileId}`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data) {
            showNotification({
              type: "success",
              message: "Profil berhasil diperbarui",
              duration: 2000,
            });
            router.back();
          }
        } catch (error) {
          console.error("Gagal update profil:", error);
          showNotification({
            type: "error",
            message: "Terjadi kesalahan saat menyimpan profil",
          });
        }
      },
    });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F9EFE4' }}>
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">Edit Profile</Text>
      </View>

      <View className="flex-1 items-center px-6 pt-8">
        {/* Avatar */}
        <TouchableOpacity
          onPress={pickProfileImage}
          className="w-40 h-40 rounded-full justify-center items-center mb-6"
          style={shadowStyle}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} className="w-full h-full rounded-full" resizeMode="cover" />
          ) : (
            <Image source={require('../../../../assets/images/logoSplash.png')} className="w-32 h-32 rounded-full" resizeMode="contain" />
          )}
          <View className="absolute bottom-0 right-0 bg-[#EEC887] rounded-full p-2">
            <Icon icon="mdi:pencil" width={20} height={20} color="#4E7D79" />
          </View>
        </TouchableOpacity>

        {/* Fullname */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#4E7D79]">Full Name</Text>
          <View className="bg-white rounded-xl px-4 py-3" style={shadowStyle}>
            <TextInput
              placeholder="Nama lengkap"
              placeholderTextColor="#4E7D79"
              value={fullname}
              onChangeText={setFullname}
              className="text-[#4E7D79]"
            />
          </View>
        </View>

        {/* Bio */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#4E7D79]">Bio</Text>
          <View className="bg-white rounded-xl px-4 py-3" style={shadowStyle}>
            <TextInput
              placeholder="Bio"
              placeholderTextColor="#4E7D79"
              value={bio}
              onChangeText={setBio}
              multiline
              className="text-[#4E7D79]"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-[#EEC887] rounded-xl py-4 items-center w-full mt-6"
        >
          <Text className="text-[#4E7D79] font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};
