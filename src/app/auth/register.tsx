// src/app/auth/register.tsx
import Button from "@/components/atoms/Button";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import { showDialogError, showDialogSuccess } from "@/utils/alert";
import { logger } from "@/utils/logger";
import { hasErrors, validate, validators } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    fullname?: string;
  }>({});

  const validateForm = () => {
    const validationRules = {
      email: [validators.required("Email is required"), validators.email()],
      password: [
        validators.required("Password is required"),
        validators.minLength(6, "Password must be at least 6 characters"),
      ],
      fullname: [
        validators.required("Display name is required"),
        validators.minLength(2, "Display name must be at least 2 characters"),
      ],
    };

    const formErrors = validate(
      {
        email,
        password,
        fullname,
      },
      validationRules
    );
    setErrors(formErrors);
    return !hasErrors(formErrors);
  };

  const handleContinue = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      logger.log("RegisterPage", "Registration Attempt", { email });
      const result = await register({
        email,
        password,
        fullname,
      });

      if (result) {
        logger.log("RegisterPage", "Registration Successful");
        showDialogSuccess("Success", "Registration successful!");
        router.replace("/(tabs)");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      logger.error("RegisterPage", "Registration Error", errorMessage);
      showDialogError("Registration Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    logger.log("RegisterPage", "Navigate to Login");
    router.push("/auth/login");
  };

  const handleGoogleSignUp = async () => {
    logger.log("RegisterPage", "Google Login Attempt");
    setIsLoading(true);
    try {
      const result = await loginWithOAuth('google');
      if (result) {
        showDialogSuccess("Success", "Google login successful!");
        router.replace("/(tabs)");
      }
    } catch (error) {
      const errorMessage = 
        error instanceof Error ? error.message : "Google login failed";
      
      logger.error("RegisterPage", "Google Login Error", error);
      showDialogError("Login Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F8F5ED] px-6"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center">
        {/* Logo Section */}
        <View className="items-center mb-6">
          <Image
            source={require("@/assets/images/splash.png")}
            className="w-[263px] h-[263px]"
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text
          className="mb-6 text-[#1A1A1A] text-center"
          style={Typography.styles.title}
        >
          Sign Up
        </Text>

        {/* Display Name Input */}
        <View className="mb-4">
          <Text className="mb-2 text-[#1A1A1A]" style={Typography.styles.body}>
            Display Name
          </Text>
          <View className="flex-row items-center border-b border-[#E0E0E0] py-3">
            <Ionicons
              name="person-outline"
              size={20}
              color="#666"
              className="mr-3"
            />
            <TextInput
              value={fullname}
              onChangeText={(text) => {
                setFullname(text);
                if (errors.fullname) {
                  setErrors((prev) => ({ ...prev, fullname: undefined }));
                }
              }}
              placeholder="Enter your display name"
              className="flex-1 text-base text-[#1A1A1A]"
            />
          </View>
          {errors.fullname && (
            <Text className="text-red-500 text-xs mt-1">{errors.fullname}</Text>
          )}
        </View>

        {/* Email Input */}
        <View className="mb-4">
          <Text className="mb-2 text-[#1A1A1A]" style={Typography.styles.body}>
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
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
              className="flex-1 text-base text-[#1A1A1A]"
            />
          </View>
          {errors.email && (
            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
          )}
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="mb-2 text-[#1A1A1A]" style={Typography.styles.body}>
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
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              className="flex-1 text-base text-[#1A1A1A]"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
          )}
        </View>

        {/* Disclaimer */}
        <Text
          className="text-[#666] text-sm text-center mb-6 leading-5"
          style={Typography.styles.body}
        >
          By signing up, you&apos;ve agree to our{" "}
          <Text className="text-blue-700">terms and conditions</Text> and{" "}
          <Text className="text-blue-700">Privacy Policy</Text>.
        </Text>

        {/* Buttons */}
        <View className="items-center mb-4">
          <Button
            onPress={handleContinue}
            className="w-full max-w-[300px] py-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center">Continue</Text>
            )}
          </Button>
        </View>
        <View className="items-center mb-6">
          <Button
            onPress={handleGoogleSignUp}
            className="w-full max-w-[300px] py-3"
            variant="secondary"
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-black text-center">Continue with Google</Text>
            )}
          </Button>
        </View>

        {/* Login Link */}
        <View className="items-center">
          <Text className="text-[#666] text-sm">
            Joined us before?{" "}
            <Text className="text-blue-700" onPress={handleLogin}>
              Login
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
