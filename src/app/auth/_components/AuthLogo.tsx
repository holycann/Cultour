import { Image } from "expo-image";
import React from "react";
import { View } from "react-native";

export function AuthLogo() {
  return (
    <View style={{ 
      alignItems: 'center', 
      marginBottom: 24 
    }}>
      <Image
        source={require("@/assets/images/splash.png")}
        style={{
          width: 263,
          height: 263
        }}
        placeholder={require("@/assets/images/adaptive-icon.png")}
        contentFit="contain"
        transition={300}
        priority="high"
        recyclingKey="auth-logo"
      />
    </View>
  );
}
