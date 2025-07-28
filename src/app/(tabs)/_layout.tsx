import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import { Tabs } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Tab navigation layout using a custom top tab bar
 */
export default function TabLayout() {
  const [activeTab, setActiveTab] = useState("index");

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Header */}
      <Header hidden={activeTab === "profile"} />

      {/* Content Area */}
      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" }, // Hide the default tab bar
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="place" />
          <Tabs.Screen name="event" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </View>

      {/* Custom Bottom Tab Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}
