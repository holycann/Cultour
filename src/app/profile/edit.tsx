import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Icon } from "@iconify/react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, isLoading, error } = useUser();

  const [fullname, setFullname] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullname(profile.fullname || "");
      setBio(profile.bio || "");
      setProfileImage(profile.avatar_url || null);
    }
  }, [profile]);

  const handleGoBack = () => {
    router.back();
  };

  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];

      // Upload the image
      try {
        const success = await uploadAvatar({
          uri: selectedImage.uri,
          type: selectedImage.type || "image/jpeg",
          name: selectedImage.fileName || "avatar.jpg",
        });

        if (success) {
          setProfileImage(selectedImage.uri);
        }
      } catch (err) {
        console.error("Failed to upload avatar:", err);
      }
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        fullname: fullname || "",
        bio: bio || "",
        avatar_url: profileImage || undefined,
      });
      router.back();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#F9EFE4" }}
      >
        <Text className="text-[#4E7D79]">Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: "#F9EFE4" }}
      >
        <Text className="text-red-500">Error: {error}</Text>
        <TouchableOpacity onPress={() => {}} className="mt-4">
          <Text className="text-[#4E7D79]">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: "#F9EFE4" }}>
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
            <Image
              source={{ uri: profileImage }}
              className="w-full h-full rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-32 h-32 rounded-full"
              resizeMode="contain"
            />
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

        {/* Email */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#4E7D79]">Email</Text>
          <View className="bg-white rounded-xl px-4 py-3" style={shadowStyle}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#4E7D79"
              value={user?.email || ""}
              editable={false}
              className="text-[#4E7D79] opacity-50"
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
