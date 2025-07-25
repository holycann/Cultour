import { Icon } from "@iconify/react";
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Image,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { userService } from "../../../../api/services/userService";
import { useGlobalNotification } from "../../../../modules/GlobalNotificationWrapper";

export default function EditProfileScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab: string }>();
  const { showNotification } = useGlobalNotification();

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [email, setEmail] = useState("yuhu@example.com");
  const [password, setPassword] = useState("example123");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Fetch user profile data
    async function fetchUserProfile() {
      try {
        const response = await userService.getCurrentProfile();
        if (response.success && response.data) {
          setEmail(response.data.email);
        }
      } catch (error) {
        console.error("Gagal mengambil profil:", error);
      }
    }

    fetchUserProfile();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const pickProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    showNotification({
      type: 'warning',
      title: 'Simpan Perubahan?',
      message: 'Apakah Anda yakin ingin menyimpan perubahan profil?',
      onCancel: () => console.log('Batal'),
      onConfirm: async () => {
        try {
          // Logika update profil
          const updateData = {
            email,
            // Tambahkan field lain yang perlu diupdate
          };

          const response = await userService.updateProfile(updateData);

          if (response.success) {
            showNotification({
              type: 'success',
              message: 'Profil berhasil diperbarui',
              duration: 2000
            });
            router.back();
          } else {
            showNotification({
              type: 'error',
              message: 'Gagal memperbarui profil',
            });
          }
        } catch (error) {
          console.error("Gagal memperbarui profil:", error);
          showNotification({
            type: 'error',
            message: 'Terjadi kesalahan saat memperbarui profil',
          });
        }
      }
    });
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

      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">Edit Profile</Text>
      </View>

      <View className="flex-1 items-center px-6 pt-8">
        {/* Foto Profil */}
        <TouchableOpacity 
          onPress={pickProfileImage}
          className="w-40 h-40 rounded-full justify-center items-center mb-6"
          style={{ 
            backgroundColor: 'white',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          {profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              className="w-full h-full rounded-full" 
              resizeMode="cover" 
            />
          ) : (
            <Image 
              source={require('../../../../assets/images/logoSplash.png')}
              className="w-32 h-32 rounded-full"
              resizeMode="contain"
            />
          )}
          <View 
            className="absolute bottom-0 right-0 bg-[#EEC887] rounded-full p-2"
          >
            <Icon 
              icon="mdi:pencil" 
              width={20} 
              height={20} 
              color="#4E7D79" 
            />
          </View>
        </TouchableOpacity>

        {/* Email */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#4E7D79]">Email</Text>
          <View 
            className="bg-white rounded-xl px-4 py-3 flex-row items-center"
            style={{ 
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Icon 
              icon="mdi:email-outline" 
              width={24} 
              height={24} 
              color="#4E7D79" 
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#4E7D79"
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-3 text-[#4E7D79]"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Password */}
        <View className="w-full mb-4">
          <Text className="mb-2 text-[#4E7D79]">Password</Text>
          <View 
            className="bg-white rounded-xl px-4 py-3 flex-row items-center"
            style={{ 
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Icon 
              icon="mdi:lock-outline" 
              width={24} 
              height={24} 
              color="#4E7D79" 
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#4E7D79"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3 text-[#4E7D79]"
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
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity
          onPress={handleSave}
          className="bg-[#EEC887] rounded-xl py-4 items-center w-full mt-6"
        >
          <Text className="text-[#4E7D79] font-bold text-lg">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
