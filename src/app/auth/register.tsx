import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { addUser } from "../../store/userAPI";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleRegister() {
    if (!name || !email || !password) {
      Alert.alert("Error", "Isi semua data!");
      return;
    }
    await addUser({ name, email, password });
    Alert.alert("Register Success", "Silakan login untuk masuk komunitas.");
    // Redirect ke halaman login
    router.push("/auth/login");
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-xl mb-6 font-bold">Register Penjelajah</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />
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
        onPress={handleRegister}
      >
        <Text className="text-white font-bold text-base">Register</Text>
      </Pressable>
    </View>
  );
}
