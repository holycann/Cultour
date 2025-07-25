import { Icon } from "@iconify/react";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Ubah jika kamu testing di emulator Android:
const BASE_URL = "http://localhost:8181"; // ganti ke 10.0.2.2:8181 jika emulator

export default function RegisterScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert("Error", "Isi semua data!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${BASE_URL}/users`, {
        email,
        password,
        role: "user", // default role
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert("Register Success", "Silakan login untuk masuk komunitas.");
        router.push("/auth/login");
      } else {
        throw new Error("Registrasi gagal.");
      }
    } catch (err: any) {
      console.error("Register error:", err);
      Alert.alert("Error", err.response?.data?.message || err.message || "Registrasi gagal");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignUp = () => {
    Alert.alert("Google Sign Up", "Fitur sign up Google akan segera hadir.");
  };

  const openTermsAndConditions = () => {
    Linking.openURL("https://cultour.holyycan.com/terms");
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://cultour.holyycan.com/privacy");
  };

  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#F9EFE4' }}>
      <StatusBar backgroundColor="#F9EFE4" barStyle="dark-content" />

      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-8">
          <View
            className="w-32 h-32 rounded-full justify-center items-center mb-4"
            style={{
              backgroundColor: 'white',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
          >
            <Image
              source={require('../../assets/images/logoSplash.png')}
              className="w-24 h-24"
              resizeMode="contain"
            />
          </View>
          <Text className="text-3xl font-bold" style={{ color: '#4E7D79' }}>
            Cultour
          </Text>
        </View>

        {/* Title */}
        <Text className="text-2xl font-bold mb-6" style={{ color: '#4E7D79' }}>
          Sign Up
        </Text>

        {/* Email Input */}
        <View
          className="flex-row items-center mb-4 px-4 py-3 rounded-xl"
          style={{
            backgroundColor: 'white',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Icon icon="mdi:email-outline" width={24} height={24} color="#4E7D79" />
          <TextInput
            placeholder="Email"
            placeholderTextColor="#4E7D79"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            className="flex-1 ml-3 text-base"
            style={{ color: '#4E7D79' }}
          />
        </View>

        {/* Password Input */}
        <View
          className="flex-row items-center mb-4 px-4 py-3 rounded-xl"
          style={{
            backgroundColor: 'white',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Icon icon="mdi:lock-outline" width={24} height={24} color="#4E7D79" />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#4E7D79"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            className="flex-1 ml-3 text-base"
            style={{ color: '#4E7D79' }}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
              width={24}
              height={24}
              color="#4E7D79"
            />
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <View className="flex-row justify-center mb-6">
          <Text className="text-center text-sm" style={{ color: '#4E7D79' }}>
            By signing up, you&apos;ve agreed to our{" "}
            <Text
              onPress={openTermsAndConditions}
              style={{ color: '#EEC887', textDecorationLine: 'underline' }}
            >
              terms and conditions
            </Text>{" "}
            and{" "}
            <Text
              onPress={openPrivacyPolicy}
              style={{ color: '#EEC887', textDecorationLine: 'underline' }}
            >
              Privacy Policy
            </Text>
          </Text>
        </View>

        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="mb-4 py-4 rounded-xl items-center"
          style={{
            backgroundColor: '#EEC887',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <Text className="text-lg font-bold" style={{ color: '#4E7D79' }}>
            {loading ? "Signing up..." : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Google Sign Up */}
        <TouchableOpacity
          onPress={handleGoogleSignUp}
          className="py-4 rounded-xl items-center flex-row justify-center"
          style={{ backgroundColor: '#EEC887' }}
        >
          <Icon icon="mdi:google" width={24} height={24} color="#4E7D79" />
          <Text className="text-lg font-bold ml-2" style={{ color: '#4E7D79' }}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View className="flex-row justify-center mt-4">
          <Text style={{ color: '#4E7D79' }}>Joined us before? </Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={{ color: '#EEC887', textDecorationLine: 'underline', fontWeight: 'bold' }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
