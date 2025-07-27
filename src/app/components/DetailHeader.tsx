import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface DetailHeaderProps {
  title: string;
  showBackButton?: boolean;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({
  title,
  showBackButton = true,
}) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View className="flex-row items-center px-4 py-3 bg-[#FFF5E1]">
      {showBackButton && (
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#4E7D79" />
        </TouchableOpacity>
      )}
      <Text className="text-xl font-bold text-[#4E7D79] flex-1">{title}</Text>
    </View>
  );
};

export default DetailHeader;
