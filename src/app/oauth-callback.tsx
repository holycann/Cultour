import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { router } from "expo-router";
import { useEffect } from "react";

export default function OAuthCallback() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/profile");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LoadingScreen
      message="Authentication Successful, Redirecting..."
      backgroundColor="#F8F5ED"
    />
  );
}
