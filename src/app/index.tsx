import CustomSplashScreen from "@/components/CustomSplashScreen";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { LogBox } from "react-native";

// Nonaktifkan warning umum yang mengganggu
LogBox.ignoreAllLogs(true);

export default function Index() {
  return (
    <CustomSplashScreen
      onAnimationComplete={() => {
        // console.log("Animation complete, navigating to tabs");
        router.replace("/(tabs)");
      }}
      imageSource={require("@/assets/images/splash.png")}
      backgroundColor={Colors.primary50}
      duration={2000}
      size={150}
    />
  );
}
