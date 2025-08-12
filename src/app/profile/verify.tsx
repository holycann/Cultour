import DetailHeader from "@/app/_components/DetailHeader";
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
import { IdentityUploader } from "./_components/IdentityUploader";
import { VerificationCheckboxes } from "./_components/VerificationCheckboxes";

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
};

export default function IdentityVerificationScreen() {
  const router = useRouter();
  const { profile, uploadIdentity } = useUser();
  const [fullName, setFullName] = useState(profile?.fullname || "");
  const [idDocument, setIdDocument] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isConfirmedIdentity, setIsConfirmedIdentity] = useState(false);
  const [isAgreedToTerms, setIsAgreedToTerms] = useState(false);
  const [isUnderstandMisleading, setIsUnderstandMisleading] = useState(false);

  useEffect(() => {
    if (profile?.identity_image_url) {
      notify.info("Already Verified", { message: "Your identity has been verified" });
      router.replace("/(tabs)/profile");
    }

    if (profile?.fullname) {
      setFullName(profile.fullname);
    }
  }, []);

  const pickIdDocument = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setIdDocument(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!fullName) {
      notify.error("Validation", { message: "Harap masukkan nama lengkap" });
      return;
    }

    if (!idDocument) {
      notify.error("Validation", { message: "Harap unggah dokumen identitas" });
      return;
    }

    if (!isConfirmedIdentity) {
      notify.error("Validation", { message: "Harap konfirmasi kepemilikan dokumen" });
      return;
    }

    if (!isAgreedToTerms) {
      notify.error("Validation", { message: "Harap setujui syarat dan ketentuan" });
      return;
    }

    if (!isUnderstandMisleading) {
      notify.error("Validation", { message: "Harap pahami konsekuensi informasi palsu" });
      return;
    }

    try {
      const success = await uploadIdentity({
        id: profile?.id || "",
        image: idDocument,
        identity_image_url: null,
      });

      if (success) {
        notify.success("Sukses", { message: "Verifikasi identitas berhasil" });
        router.replace("/profile");
      }
    } catch (error) {
      notify.error("Error", { message: "Gagal memperbarui profil" });
    }
  };

  const openTermsAndConditions = () => {
    notify.info("Syarat & Ketentuan", { message: "Fitur akan segera hadir." });
  };

  const openPrivacyPolicy = () => {
    notify.info("Kebijakan Privasi", { message: "Fitur akan segera hadir." });
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
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
        <IdentityUploader
          idDocument={idDocument}
          onPickDocument={pickIdDocument}
        />

        {/* Checkbox */}
        <VerificationCheckboxes
          isConfirmedIdentity={isConfirmedIdentity}
          isAgreedToTerms={isAgreedToTerms}
          isUnderstandMisleading={isUnderstandMisleading}
          onToggleConfirmedIdentity={() =>
            setIsConfirmedIdentity(!isConfirmedIdentity)
          }
          onToggleAgreedToTerms={() => setIsAgreedToTerms(!isAgreedToTerms)}
          onToggleUnderstandMisleading={() =>
            setIsUnderstandMisleading(!isUnderstandMisleading)
          }
          onOpenTermsAndConditions={openTermsAndConditions}
          onOpenPrivacyPolicy={openPrivacyPolicy}
        />

        {/* Tombol Simpan */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-[#EEC887] rounded-2xl py-4 items-center"
        >
          <Text className="text-[#4E7D79] font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}