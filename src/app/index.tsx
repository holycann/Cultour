import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StatusBar, View } from "react-native";

export default function SplashScreen() {
  const router = useRouter();
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade-in logo
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      // Setelah logo muncul, fade-in teks
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    // Navigasi setelah 2 detik
    const timer = setTimeout(() => {
      router.replace("/dashboard/home");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: "#EEC887" }}
    >
      <StatusBar backgroundColor="#EEC887" barStyle="dark-content" />
      <View className="items-center">
        <Animated.Image
          source={require("../assets/images/logoHeader.png")}
          style={{
            opacity: logoOpacity,
            width: 250,
            height: 250,
            resizeMode: "contain",
          }}
        />
        <Animated.Text
          style={{
            marginTop: 24,
            fontSize: 30,
            fontWeight: "bold",
            color: "#4E7D79",
            opacity: textOpacity,
          }}
        ></Animated.Text>
      </View>
    </View>
  );
}
