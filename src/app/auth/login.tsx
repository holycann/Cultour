import { Icon } from "@iconify/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
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

// Pastikan Anda menambahkan konfigurasi Supabase Anda di sini
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Isi email & password!");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Simpan token ke AsyncStorage
      if (data.session) {
        await AsyncStorage.setItem('authToken', data.session.access_token);
        
        // Set token ke header untuk API selanjutnya
        supabase.auth.setSession(data.session);

        Alert.alert("Success", "Login berhasil, selamat datang!");
        router.push("/dashboard/home");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    Alert.alert("Google Login", "Fitur login Google akan segera hadir.");
  };

  const openTermsAndConditions = () => {
    Linking.openURL("https://cultour.holyycan.com/terms"); // Ganti dengan URL sebenarnya
  };

  const openPrivacyPolicy = () => {
    Linking.openURL("https://cultour.holyycan.com/privacy"); // Ganti dengan URL sebenarnya
  };

  return (
    <View 
      className="flex-1" 
      style={{ backgroundColor: '#F9EFE4' }}
    >
      <StatusBar 
        backgroundColor="#F9EFE4" 
        barStyle="dark-content" 
      />

      <View className="flex-1 justify-center px-6">
        {/* Logo */}
        <View className="items-center mb-8">
          <View 
            className="w-32 h-32 rounded-full justify-center items-center mb-4"
            style={{ 
              backgroundColor: 'white',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
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
          
          <Text 
            className="text-3xl font-bold"
            style={{ color: '#4E7D79' }}
          >
            Cultour
          </Text>
        </View>

        {/* Login */}
        <Text 
          className="text-2xl font-bold mb-6"
          style={{ color: '#4E7D79' }}
        >
          Login
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

        {/* Terms and Conditions */}
        <View className="flex-row justify-center mb-6">
          <Text 
            className="text-center text-sm"
            style={{ color: '#4E7D79' }}
          >
            By signing up, you've agreed to our{" "}
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

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="mb-4 py-4 rounded-xl items-center"
          style={{ 
            backgroundColor: '#EEC887',
            opacity: loading ? 0.5 : 1
          }}
        >
          <Text 
            className="text-lg font-bold"
            style={{ color: '#4E7D79' }}
          >
            {loading ? "Logging in..." : "Continue"}
          </Text>
        </TouchableOpacity>

        {/* Google Login Button */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          className="py-4 rounded-xl items-center flex-row justify-center"
          style={{ 
            backgroundColor: '#EEC887',
          }}
        >
          <Icon icon="mdi:google" width={24} height={24} color="#4E7D79" />
          <Text 
            className="text-lg font-bold ml-2"
            style={{ color: '#4E7D79' }}
          >
            Continue with Google
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
