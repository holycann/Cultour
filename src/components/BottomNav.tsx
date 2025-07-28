import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  primary: "#2C5F5D",
  white: "#FFFFFF",
  background: "#F5F5F5",
  inactive: "#8E8E8E",
  activeBackground: "rgba(44, 95, 93, 0.1)", // Light primary color
};

type BottomNavProps = {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
};

type NavItemProps = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  isActive?: boolean;
};

export default function BottomNav({
  activeTab = "home",
  onTabChange,
}: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Determine active tab based on current pathname
    const determineActiveTab = () => {
      if (pathname.includes("/profile")) return "profile";
      if (pathname.includes("/event")) return "event";
      if (pathname.includes("/place")) return "place";
      return "home";
    };

    const currentActiveTab = determineActiveTab();
    if (onTabChange) {
      onTabChange(currentActiveTab);
    }
  }, [pathname]);

  const handleTabPress = (tabName: string) => {
    if (onTabChange) {
      onTabChange(tabName);
    }

    switch (tabName) {
      case "home":
        router.replace("/(tabs)/home");
        break;
      case "place":
        router.replace("/(tabs)/place");
        break;
      case "event":
        router.replace("/(tabs)/event");
        break;
      case "profile":
        router.replace("/(tabs)/profile");
        break;
      default:
        router.replace("/(tabs)");
        break;
    }
  };

  const NavItem = ({ name, icon, activeIcon, isActive }: NavItemProps) => (
    <TouchableOpacity
      style={styles.navItemContainer}
      onPress={() => handleTabPress(name)}
    >
      <View style={[styles.navItem, isActive && styles.activeNavItem]}>
        <Ionicons
          name={isActive ? activeIcon : icon}
          size={24}
          color={isActive ? COLORS.white : COLORS.inactive}
        />
        {!isActive && (
          <Text style={styles.navItemText}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.bottomNav}>
      <NavItem
        name="home"
        icon="home-outline"
        activeIcon="home"
        isActive={activeTab === "home"}
      />
      <NavItem
        name="place"
        icon="grid-outline"
        activeIcon="grid"
        isActive={activeTab === "place"}
      />
      <NavItem
        name="event"
        icon="calendar-outline"
        activeIcon="calendar"
        isActive={activeTab === "event"}
      />
      <NavItem
        name="profile"
        icon="person-outline"
        activeIcon="person"
        isActive={activeTab === "profile"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#EEC887", // Matching the background color from the image
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItemContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 200, // Circular background
  },
  activeNavItem: {
    backgroundColor: COLORS.primary,
    width: 50, // Make active background a perfect circle
    height: 50, // Make active background a perfect circle
    borderRadius: 25, // Ensure perfect circle
  },
  navItemText: {
    fontSize: 10,
    color: COLORS.inactive,
    marginTop: 4,
  },
});
