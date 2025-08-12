import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface VerificationCheckboxesProps {
  isConfirmedIdentity: boolean;
  isAgreedToTerms: boolean;
  isUnderstandMisleading: boolean;
  onToggleConfirmedIdentity: () => void;
  onToggleAgreedToTerms: () => void;
  onToggleUnderstandMisleading: () => void;
  onOpenTermsAndConditions: () => void;
  onOpenPrivacyPolicy: () => void;
}

export function VerificationCheckboxes({
  isConfirmedIdentity,
  isAgreedToTerms,
  isUnderstandMisleading,
  onToggleConfirmedIdentity,
  onToggleAgreedToTerms,
  onToggleUnderstandMisleading,
  onOpenTermsAndConditions,
  onOpenPrivacyPolicy,
}: VerificationCheckboxesProps) {
  return (
    <View className="mb-4">
      <TouchableOpacity
        className="flex-row items-center mb-2"
        onPress={onToggleConfirmedIdentity}
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
        onPress={onToggleAgreedToTerms}
      >
        <Ionicons
          name={isAgreedToTerms ? "checkbox-outline" : "square-outline"}
          size={24}
          color="#4E7D79"
        />
        <Text className="ml-2 text-[#4E7D79] text-xs">
          I agree that the platform may use my information solely for identity
          verification purposes.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center mb-2"
        onPress={onToggleUnderstandMisleading}
      >
        <Ionicons
          name={isUnderstandMisleading ? "checkbox-outline" : "square-outline"}
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
            onPress={onOpenTermsAndConditions}
            style={{ color: "#EEC887", textDecorationLine: "underline" }}
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            onPress={onOpenPrivacyPolicy}
            style={{ color: "#EEC887", textDecorationLine: "underline" }}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
}