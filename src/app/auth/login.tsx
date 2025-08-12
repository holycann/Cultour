import Button from "@/components/ui/Button";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import notify from "@/services/notificationService";
import { logger } from "@/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Linking,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { AuthFooter } from "./_components/AuthFooter";
import { AuthLogo } from "./_components/AuthLogo";
import { AuthTitle } from "./_components/AuthTitle";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithOAuth, exchangeCodeForSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const exchangeCode = async () => {
      const listener = Linking.addEventListener("url", async ({ url }) => {
        const urlParams = new URL(url).searchParams;
        const code = urlParams.get("code");

        if (code) {
          await exchangeCodeForSession(code);
        }
      });

      return () => listener.remove();
    };

    exchangeCode();
  }, [exchangeCodeForSession]);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      notify.error("Validation", { message: "Please enter both email and password" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });

      if (result) {
        notify.success("Welcome back!", { message: "Login successful" });
        router.replace("/(tabs)");
      } else {
        logger.error("LoginPage", "Login Failed", null);
        notify.error("Login Failed", { message: "Invalid email or password" });
      }
    } catch (error) {
      logger.error("LoginPage", "Login Error", error);
      notify.error("Error", { message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const url = await loginWithOAuth("google");
      if (url) {
        await Linking.openURL(url);
      } else {
        notify.error("Login Error", { message: "Failed to initiate Google login" });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Google login failed";

      notify.error("Login Error", { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push("/auth/register");
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F8F5ED] px-6"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center">
        {/* Logo */}
        <AuthLogo />

        {/* Title */}
        <AuthTitle title="Login" />

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
          onPress={handleGoogleLogin}
          className="mb-8"
          disabled={isLoading}
        />

        {/* Register link */}
        <AuthFooter
          message="New here?"
          linkText="Sign up"
          onLinkPress={handleRegister}
        />
      </View>
    </ScrollView>
  );
}
