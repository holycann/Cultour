import { Icon } from "@iconify/react";
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
    <View className="relative flex-row items-center justify-center px-4 py-4 bg-[#EEC887]">
      {showBackButton && (
        <TouchableOpacity
          onPress={handleGoBack}
          className="absolute left-4 top-1/2 -translate-y-1/2"
        >
          <Icon
            icon="mdi:arrow-left-circle-outline"
            width={30}
            height={30}
            color="#4E7D79"
          />
        </TouchableOpacity>
      )}
      <Text className="text-xl font-bold text-[#1E1E1E]">{title}</Text>
    </View>
  );
};

export default DetailHeader;
