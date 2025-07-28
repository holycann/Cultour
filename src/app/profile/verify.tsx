import DetailHeader from "@/app/components/DetailHeader";
import { useUser } from "@/hooks/useUser";
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
  const { profile, updateProfile } = useUser();
  const [fullName, setFullName] = useState(profile?.fullname || "");
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [isConfirmedIdentity, setIsConfirmedIdentity] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isUnderstandMisleading, setIsUnderstandMisleading] = useState(false);

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
      await updateProfile({
        fullname: fullName,
        identity_image_url: idDocument,
      });

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
    <View className="flex-1 bg-[#EEC887]">
      {/* Header dengan lekukan */}
      <DetailHeader title="Identity Verification" />

      <ScrollView
        className="bg-white rounded-t-3xl px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Deskripsi */}
        <Text className="text-[#4E7D79] mb-4 text-sm">
          To validate the event creator as a verified local by submitting a form
          of identity, you can upload a valid form of identification such as a
          National ID (KTP), Drivers License (SIM), or Passport.
        </Text>

        {/* Nama Lengkap */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79] font-semibold">Full Name</Text>
          <TextInput
            placeholder="Your Full Name"
            placeholderTextColor="#4E7D79"
            value={fullName}
            onChangeText={setFullName}
            className="bg-white rounded-xl px-4 py-3 text-[#4E7D79]"
            style={shadowStyle}
          />
        </View>

        {/* Upload Dokumen */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79] font-semibold">
            Upload ID Document
          </Text>
          <TouchableOpacity
            onPress={pickIdDocument}
            className="bg-white rounded-xl h-48 justify-center items-center"
            style={shadowStyle}
          >
            {idDocument ? (
              <Image
                source={{ uri: idDocument }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <Text className="text-[#4E7D79]">Upload ID Document</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Checkbox */}
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
          className="bg-[#EEC887] rounded-2xl py-4 items-center"
        >
          <Text className="text-[#4E7D79] font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
};
