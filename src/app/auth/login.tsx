import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { loginUser } from "../../store/userAPI";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Isi email & password!");
      return;
    }
    const user = await loginUser({ email, password });
    if (user) {
      Alert.alert("Success", "Login berhasil, selamat datang!");
      router.push("/dashboard/home");
    } else {
      Alert.alert("Error", "Email atau password salah!");
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-xl mb-6 font-bold">Login Penjelajah</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        placeholder="Your Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Pressable
        className="bg-blue-700 rounded-xl px-8 py-4 active:opacity-80"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-base">Login</Text>
      </Pressable>
    </View>
  );
}
