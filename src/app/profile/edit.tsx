import DetailHeader from "@/app/_components/DetailHeader";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import notify from "@/services/notificationService";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileImagePicker } from "./_components/ProfileImagePicker";

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, isLoading } = useUser();

  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullname(profile.fullname || "");
      setBio(profile.bio || "");
      setProfileImage(profile.avatar_url || null);
    }
  }, [profile]);

  const pickProfileImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];

        try {
          setIsUpdating(true);
          const success = await uploadAvatar({
            id: profile?.id || "",
            image: selectedImage,
            avatar_url: profile?.avatar_url || null,
          });

          if (success) {
            setProfileImage(selectedImage.uri);
            notify.success("Foto Profil Berhasil Diperbarui");
          } else {
            notify.error("Gagal Mengunggah Foto", {
              message: "Tidak dapat mengunggah foto profil. Silakan coba lagi."
            });
          }
        } catch (err) {
          console.error("Failed to upload avatar:", err);
          notify.error("Kesalahan Unggah", {
            message: "Terjadi kesalahan saat mengunggah foto. Silakan coba lagi."
          });
        } finally {
          setIsUpdating(false);
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      notify.error("Kesalahan Pemilihan Foto", {
        message: "Tidak dapat membuka galeri foto. Silakan coba lagi."
      });
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (!fullname.trim()) {
      notify.error("Nama Tidak Valid", {
        message: "Nama lengkap tidak boleh kosong"
      });
      return;
    }

    // Check if anything has actually changed
    if (
      fullname === profile?.fullname && 
      bio === profile?.bio
    ) {
      notify.info("Tidak Ada Perubahan", {
        message: "Tidak ada data yang diperbarui"
      });
      return;
    }

    try {
      setIsUpdating(true);
      
      const updateResult = await updateProfile({
        id: profile?.id || "",
        fullname: fullname.trim() || "",
        bio: bio.trim() || "",
      });

      if (updateResult) {
        notify.success("Profil Berhasil Diperbarui");
        router.back();
      } else {
        notify.error("Gagal Memperbarui Profil", {
          message: "Tidak dapat memperbarui profil. Silakan coba lagi."
        });
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      
      // Detailed error handling
      if (err instanceof Error) {
        notify.error("Kesalahan Sistem", {
          message: err.message || "Terjadi kesalahan saat memperbarui profil"
        });
      } else {
        notify.error("Kesalahan Tidak Dikenal", {
          message: "Terjadi kesalahan yang tidak terduga"
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      {/* Custom Header */}
      <DetailHeader title="Edit Profile" showBackButton={true} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        className="bg-white rounded-t-3xl px-4 md:px-6 pt-6 md:pt-8"
      >
        {/* Avatar Picker */}
        <ProfileImagePicker
          profileImage={profileImage}
          onPickImage={pickProfileImage}
          disabled={isUpdating}
        />

        {/* Full Name */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#1E1E1E] font-semibold">Full Name</Text>
          <TextInput
            placeholder="Nama lengkap"
            placeholderTextColor="#4E7D79"
            value={fullname}
            onChangeText={setFullname}
            editable={!isUpdating}
            className="bg-white rounded-xl px-4 py-3 text-[#1E1E1E]"
            style={shadowStyle}
          />
        </View>

        {/* Email */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#1E1E1E] font-semibold">Email</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#4E7D79"
            value={user?.email || ""}
            editable={false}
            className="bg-white rounded-xl px-4 py-3 text-[#1E1E1E] opacity-50"
            style={shadowStyle}
          />
        </View>

        {/* Bio */}
        <View className="w-full mb-6">
          <Text className="mb-2 text-[#1E1E1E] font-semibold">Bio</Text>
          <TextInput
            placeholder="Bio"
            placeholderTextColor="#4E7D79"
            value={bio}
            onChangeText={setBio}
            editable={!isUpdating}
            multiline
            className="bg-white rounded-xl px-4 py-3 text-[#1E1E1E]"
            style={shadowStyle}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isUpdating}
          className={`rounded-2xl py-4 items-center w-full mb-10 ${
            isUpdating ? 'bg-gray-300' : 'bg-[#EEC887]'
          }`}
        >
          <Text className={`font-bold text-lg ${
            isUpdating ? 'text-gray-500' : 'text-[#4E7D79]'
          }`}>
            {isUpdating ? 'Menyimpan...' : 'Simpan'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}