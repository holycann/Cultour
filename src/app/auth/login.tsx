import Button from "@/components/atoms/Button";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);
    try {
      logger.log("LoginPage", "Login Attempt", { email });
      const result = await login({ email, password });

      if (result) {
        logger.log("LoginPage", "Login Successful");
        router.replace("/(tabs)");
      } else {
        logger.error("LoginPage", "Login Failed", null);
        Alert.alert("Login Failed", "Invalid email or password");
      }
    } catch (error) {
      logger.error("LoginPage", "Login Error", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    logger.log("LoginPage", "Navigate to Register");
    router.push("/auth/register");
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F8F5ED] px-6"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center">
        {/* Logo */}
        <View className="items-center mb-12">
          <Image
            source={require("@/assets/images/splash.png")}
            style={{ width: 263, height: 263 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text
          className="mb-8 text-[#333]"
          style={{ ...Typography.styles.title, textAlign: "left" }}
        >
          Login
        </Text>

        {/* Email Input */}
        <View className="mb-6">
          <Text className="mb-2 text-[#333]" style={Typography.styles.body}>
            Email
          </Text>
          <View className="flex-row items-center border-b border-[#E0E0E0] py-3">
            <Ionicons
              name="at-outline"
              size={20}
              color="#666"
              className="mr-3"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="flex-1 text-base text-[#333]"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-8">
          <Text className="mb-2 text-[#333]" style={Typography.styles.body}>
            Password
          </Text>
          <View className="flex-row items-center border-b border-[#E0E0E0] py-3">
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#666"
              className="mr-3"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 text-base text-[#333]"
              placeholder="Enter your password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <Button
          label="Login"
          onPress={handleLogin}
          className="mb-4"
          disabled={isLoading}
        />
        <Button
          label="Login with Google"
          onPress={() => {
            logger.log("LoginPage", "Google Login Attempt");
            Alert.alert("Coming Soon", "Google login will be available soon");
          }}
          className="mb-8"
          variant="secondary"
          disabled={isLoading}
        />

        {/* Register link */}
        <View className="items-center">
          <Text className="text-[#666] text-sm">
            New here?{" "}
            <Text className="text-blue-700" onPress={handleRegister}>
              Sign up
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
