// src/app/dashboard/_layout.tsx
import { Stack, usePathname } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import BottomNavBar from "../../modules/dashboard/BottemNavbar";
import DashboardHeader from "../../modules/dashboard/DashboardHeader";

export default function DashboardLayout() {
  const pathname = usePathname();
  let active = "home";
  if (pathname.endsWith("/place")) active = "place";
  if (pathname.endsWith("/event")) active = "event";
  if (pathname.endsWith("/profile")) active = "profile";

  // State search dan notif
  const [search, setSearch] = useState("");
  function handleNotifPress() {
    // logic ke halaman notif atau popup notif
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <DashboardHeader
        logoSource={require("../../../assets/images/logoHeader.png")}
        searchValue={search}
        setSearchValue={setSearch}
        onSearch={() => {
          /* search logic */
        }}
        onNotifPress={handleNotifPress}
      />
      <Stack screenOptions={{ headerShown: false }} />
      <BottomNavBar active={active} />
    </View>
  );
}
