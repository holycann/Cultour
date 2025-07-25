import { Icon } from "@iconify/react";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

type BottomNavBarProps = {
  active: string;
};

const menus = [
  { key: "home", label: "Home", icon: "mdi:home", route: "/dashboard/home" },
  { key: "place", label: "Place", icon: "mdi:apps", route: "/dashboard/place" },
  {
    key: "event",
    label: "Event",
    icon: "mdi:calendar",
    route: "/dashboard/event",
  },
  {
    key: "profile",
    label: "Profile",
    icon: "mdi:account",
    route: "/dashboard/profile",
  },
];

const NAV_BG = "#EEC887";
const ACTIVE_BG = "#4E7D79";
const ACTIVE_ICON = "#FFFFFF";
const INACTIVE_ICON = "#4E7D79";
const LABEL_COLOR = "#4E7D79";

export default function BottomNavBar({ active }: BottomNavBarProps) {
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "",
        alignItems: "center",
        backgroundColor: NAV_BG,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 18,
        paddingVertical: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      {menus.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => {
              if (!isActive) router.push(item.route as never);
            }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isActive ? (
              // Icon aktif: bulat hijau, icon putih
              <View
                style={{
                  backgroundColor: ACTIVE_BG,
                  borderRadius: 999,
                  padding: 14,
                  marginBottom: 4,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  icon={item.icon}
                  width={26}
                  height={26}
                  color={ACTIVE_ICON}
                />
              </View>
            ) : (
              // Icon lain: icon hijau, tanpa background bulat
              <View style={{ marginBottom: 6, alignItems: "center" }}>
                <Icon
                  icon={item.icon}
                  width={24}
                  height={24}
                  color={INACTIVE_ICON}
                />
              </View>
            )}
            <Text
              style={{
                color: LABEL_COLOR,
                fontWeight: isActive ? "bold" : "normal",
                fontSize: 12,
                textAlign: "center",
                marginTop: 0,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
