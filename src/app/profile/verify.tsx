import { useUser } from "@/hooks/useUser"; // Added useUser hook
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function IdentityVerificationScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUser(); // Changed user to profile
  const [fullName, setFullName] = useState(profile?.fullname || ""); // Pre-fill with profile's name if available
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [isConfirmedIdentity, setIsConfirmedIdentity] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isUnderstandMisleading, setIsUnderstandMisleading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const pickIdDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdDocument(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    // Validasi input
    if (!fullName) {
      Alert.alert("Error", "Harap masukkan nama lengkap");
      return;
    }

    if (!idDocument) {
      Alert.alert("Error", "Harap unggah dokumen identitas");
      return;
    }

    if (!isConfirmedIdentity) {
      Alert.alert("Error", "Harap konfirmasi kepemilikan dokumen");
      return;
    }

    if (!isAgreedToTerms) {
      Alert.alert("Error", "Harap setujui syarat dan ketentuan");
      return;
    }

    if (!isUnderstandMisleading) {
      Alert.alert("Error", "Harap pahami konsekuensi informasi palsu");
      return;
    }

    try {
      // Update profile with verification details
      await updateProfile({
        fullname: fullName,
        identity_image_url: idDocument,
      });

      // Jika semua validasi lolos
      Alert.alert("Sukses", "Verifikasi identitas berhasil", [
        {
          text: "OK",
          onPress: () => router.push("/dashboard/event"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Gagal memperbarui profil");
    }
  };

  const openTermsAndConditions = () => {
    Alert.alert("Syarat & Ketentuan", "Fitur akan segera hadir.");
  };

  const openPrivacyPolicy = () => {
    Alert.alert("Kebijakan Privasi", "Fitur akan segera hadir.");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#F9EFE4" }}>
      {/* Header */}
      <View className="flex-row items-center p-4 justify-between">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79] flex-1 text-center">
          Identity Verification
        </Text>
        <View className="w-6"></View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 20,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Deskripsi */}
        <Text className="text-[#4E7D79] mb-4 text-sm">
          To validate the event creator as a verified local by submitting a form
          of identity, You can upload a valid form of identification such as a
          National ID (KTP), Drivers License (SIM), or Passport.
        </Text>

        {/* Nama Lengkap */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79]">Full Name</Text>
          <TextInput
            placeholder="Your Full Name"
            placeholderTextColor="#4E7D79"
            value={fullName}
            onChangeText={setFullName}
            className="bg-white rounded-xl px-4 py-3 text-[#4E7D79]"
          />
        </View>

        {/* Unggah Dokumen ID */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79]">Upload ID Document</Text>
          <TouchableOpacity
            onPress={pickIdDocument}
            className="bg-white rounded-xl h-48 justify-center items-center"
          >
            {idDocument ? (
              <Image
                source={{ uri: idDocument }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Text className="text-[#4E7D79]">Upload ID Document</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Checkbox Konfirmasi */}
        <View className="mb-4">
          <TouchableOpacity
            className="flex-row items-center mb-2"
            onPress={() => setIsConfirmedIdentity(!isConfirmedIdentity)}
          >
            <Ionicons
              name={isConfirmedIdentity ? "checkbox-outline" : "square-outline"}
              size={24}
              color="#4E7D79"
            />
            <Text className="ml-2 text-[#4E7D79] text-xs">
              I confirm that the uploaded identity document belongs to me and is
              valid.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center mb-2"
            onPress={() => setIsAgreedToTerms(!isAgreedToTerms)}
          >
            <Ionicons
              name={isAgreedToTerms ? "checkbox-outline" : "square-outline"}
              size={24}
              color="#4E7D79"
            />
            <Text className="ml-2 text-[#4E7D79] text-xs">
              I agree that the platform may use my information solely for
              identity verification purposes.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center mb-2"
            onPress={() => setIsUnderstandMisleading(!isUnderstandMisleading)}
          >
            <Ionicons
              name={
                isUnderstandMisleading ? "checkbox-outline" : "square-outline"
              }
              size={24}
              color="#4E7D79"
            />
            <Text className="ml-2 text-[#4E7D79] text-xs">
              I understand that submitting false or misleading information may
              result in the suspension of my account.
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2">
            <Text className="text-[#4E7D79] text-xs text-center">
              I have read and agree to the{" "}
              <Text
                onPress={openTermsAndConditions}
                style={{ color: "#EEC887", textDecorationLine: "underline" }}
              >
                Terms & Conditions
              </Text>{" "}
              and{" "}
              <Text
                onPress={openPrivacyPolicy}
                style={{ color: "#EEC887", textDecorationLine: "underline" }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-[#EEC887] rounded-xl py-4 items-center"
        >
          <Text className="text-[#4E7D79] font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
