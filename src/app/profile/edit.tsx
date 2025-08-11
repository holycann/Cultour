import DetailHeader from "@/app/components/DetailHeader";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, isLoading } = useUser();

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

  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];

      try {
        const success = await uploadAvatar({
          id: profile?.id || "",
          image: selectedImage,
          avatar_url: profile?.avatar_url || null,
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
        id: profile?.id || "",
        fullname: fullname || "",
        bio: bio || "",
      });
      router.back();
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 justify-center items-center bg-[#F9EFE4]"
      >
        <Text className={`text-center text-[#4E7D79]`}>
          {"Loading profile..."}
        </Text>
      </SafeAreaView>
    );
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
        <TouchableOpacity
          onPress={pickProfileImage}
          className="w-32 h-32 rounded-full justify-center items-center self-center mb-6"
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
              className="w-28 h-28 rounded-full"
              resizeMode="contain"
            />
          )}
          <View className="absolute bottom-0 right-0 bg-[#EEC887] rounded-full p-2">
            <Ionicons name="pencil-outline" size={20} color="#4E7D79" />
          </View>
        </TouchableOpacity>

        {/* Full Name */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#1E1E1E] font-semibold">Full Name</Text>
          <TextInput
            placeholder="Nama lengkap"
            placeholderTextColor="#4E7D79"
            value={fullname}
            onChangeText={setFullname}
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
            multiline
            className="bg-white rounded-xl px-4 py-3 text-[#1E1E1E]"
            style={shadowStyle}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-[#EEC887] rounded-2xl py-4 items-center w-full mb-10"
        >
          <Text className="text-[#4E7D79] font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
};
