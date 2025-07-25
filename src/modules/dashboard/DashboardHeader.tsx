// src/modules/dashboard/DashboardHeader.tsx
import { Icon } from "@iconify/react";
import { Image, TextInput, View } from "react-native";

type DashboardHeaderProps = {
  onSearch: () => void;
  onNotifPress: () => void;
  logoSource: any; // atau ImageSourcePropType dari 'react-native'
  searchValue: string;
  setSearchValue: (value: string) => void;
};

export default function DashboardHeader({
  onSearch,
  onNotifPress,
  logoSource,
  searchValue,
  setSearchValue,
}: DashboardHeaderProps) {
  return (
    <View className="flex-row items-center px-2 py-2 mt-2">
      {/* Logo */}
      <Image
        source={logoSource}
        style={{ width: 32, height: 32, resizeMode: "contain" }}
      />

      {/* Search Box */}
      <View className="flex-1 mx-2 border border-zinc-400 rounded-full flex-row items-center px-3 py-1 bg-white">
        <TextInput
          placeholder="Search Location"
          placeholderTextColor="#bdbdbd"
          value={searchValue}
          onChangeText={setSearchValue}
          style={{
            flex: 1,
            fontSize: 16,
            color: "#222",
            paddingVertical: 4,
          }}
        />
        <Icon icon="mdi:magnify" width={20} height={20} color="#636363" />
      </View>
    </View>
  );
}
