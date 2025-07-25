import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  StatusBar,
  Text,
  View
} from "react-native";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulasi proses loading atau autentikasi
    const timer = setTimeout(() => {
      // Navigasi ke halaman selanjutnya (misalnya dashboard atau login)
      router.replace("/dashboard/home");
    }, 2000); // Tampilkan splash screen selama 2 detik

    // Membersihkan timer jika komponen di-unmount
    return () => clearTimeout(timer);
  }, []);

  return (
    <View 
      className="flex-1 justify-center items-center" 
      style={{ 
        backgroundColor: '#F9EFE4' 
      }}
    >
      <StatusBar 
        backgroundColor="#F9EFE4" 
        barStyle="dark-content" 
      />
      
      <View className="items-center">
        <View 
          className="w-48 h-48 rounded-full justify-center items-center"
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
          <View className="w-32 h-32">
            <Image 
              source={{ 
                uri: '../../assets/images/logoSplash.png' 
              }}
              className="w-full h-full"
              resizeMode="contain"
            />
          </View>
        </View>
        
        <Text 
          className="mt-6 text-3xl font-bold"
          style={{ color: '#4E7D79' }}
        >
          Cultour
        </Text>
      </View>
    </View>
  );
}
