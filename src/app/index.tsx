import CustomSplashScreen from "@/components/CustomSplashScreen";
import Colors from "@/constants/Colors";
import { router } from "expo-router";

export default function Index() {
  return (
    <CustomSplashScreen
      onAnimationComplete={() => router.replace("/(tabs)/home")} // 👈 langsung navigasi ke halaman
      imageSource={require("@/assets/images/splash.png")}
      backgroundColor={Colors.primary50}
      duration={2000}
      size={150}
    />
  );
}
