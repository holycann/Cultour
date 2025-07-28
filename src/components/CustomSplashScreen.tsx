import Colors from "@/constants/Colors";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface CustomSplashScreenProps {
  onAnimationComplete: () => void;
  imageSource?: any;
  backgroundColor?: string;
  duration?: number;
  size?: number;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({
  onAnimationComplete,
  imageSource = require("@/assets/images/splash.png"),
  backgroundColor = Colors.primary50,
  duration = 2000,
  size = width * 0.55, // default responsif
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setIsReady(true);
      } catch (e) {
        console.warn("Error preparing splash screen:", e);
      }
    };

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: duration * 0.3,
          useNativeDriver: true,
        }).start(() => {
          onAnimationComplete();
        });
      }, duration * 0.7);

      return () => clearTimeout(timer);
    }
  }, [isReady, fadeAnim, scaleAnim, duration, onAnimationComplete]);

  if (!isReady) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Image
          source={imageSource}
          style={{ width: size, height: size }} // ✅ ukuran dinamis
          resizeMode="contain"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CustomSplashScreen;
