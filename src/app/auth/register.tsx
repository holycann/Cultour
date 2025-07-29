// src/app/auth/register.tsx
import Button from "@/components/atoms/Button";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";
import { hasErrors, validate, validators } from "@/utils/validation";
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
      displayName: [
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
        fullname: fullname,
      });

      if (result) {
        logger.log("RegisterPage", "Registration Successful");
        router.replace("/(tabs)");
      } else {
        logger.error(
          "RegisterPage",
          "Registration Failed",
          "Unable to create account"
        );
        Alert.alert(
          "Registration Failed",
          "Unable to create account. Please try again."
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      logger.error("RegisterPage", "Registration Error", errorMessage);

      Alert.alert(
        "Registration Error",
        errorMessage || "Unable to complete registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    logger.log("RegisterPage", "Navigate to Login");
    router.push("/auth/login");
  };

  const handleGoogleSignUp = async () => {
    try {
      logger.log("RegisterPage", "Google Registration Attempt");
      await loginWithOAuth("google");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal melakukan registrasi dengan Google";

      Alert.alert("Error", errorMessage);
      logger.error("RegisterPage", "Google Registration Error", errorMessage);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-[#F8F5ED] px-6"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center">
        {/* Logo Section */}
        <View className="items-center">
          <Image
            source={require("@/assets/images/splash.png")}
            style={{ width: 263, height: 263 }}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text
          className="mb-8 text-[#1A1A1A]"
          style={[Typography.styles.title, { textAlign: "left" }]}
        >
          Sign Up
        </Text>

        {/* Display Name Input */}
        <View className="mb-6">
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
        <View className="mb-6">
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
        <View className="mb-8">
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
          className="text-[#666] text-sm mb-8 leading-5"
          style={Typography.styles.body}
        >
          By signing up, you&apos;ve agree to our{" "}
          <Text className="text-blue-700">terms and conditions</Text> and{" "}
          <Text className="text-blue-700">Privacy Policy</Text>.
        </Text>

        {/* Buttons */}
        <Button
          label="Continue"
          onPress={handleContinue}
          className="w-[197px] h-[32px] mb-4 self-center"
          disabled={isLoading}
        />
        <Button
          label="Continue with Google"
          onPress={handleGoogleSignUp}
          className="w-[197px] h-[32px] mb-4 self-center"
          variant="secondary"
          disabled={isLoading}
        />

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
