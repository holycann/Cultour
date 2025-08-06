import DetailHeader from "@/app/components/DetailHeader";
import Maps from "@/components/Maps";
import { useCity } from "@/hooks/useCity";
import { useEvent } from "@/hooks/useEvent";
import { useProvince } from "@/hooks/useProvince";
import { useUser } from "@/hooks/useUser";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";

import Colors from "@/constants/Colors";
import { useAuth } from "@/hooks/useAuth";

export default function AddEventScreen() {
  const router = useRouter();
  const { profile } = useUser();
  const { user } = useAuth();

  // State untuk event
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
  }>({});
  const [isFullScreenMapVisible, setIsFullScreenMapVisible] = useState(false);
  const [provinceIsFocus, setProvinceIsFocus] = useState(false);
  const [cityIsFocus, setCityIsFocus] = useState(false);

  const { createEvent } = useEvent();
  const { provinces, fetchProvinces } = useProvince();
  const { cities, fetchCities } = useCity();

  // Cek status autentikasi dan verifikasi
  useEffect(() => {
    const checkUserStatus = async () => {
      // Cek apakah user sudah login
      if (!user) {
        Alert.alert("Login Required", "Please login to create an event", [
          { text: "Login", onPress: () => router.replace("/auth/login") },
        ]);
        return;
      }

      // Cek apakah user sudah terverifikasi
      if (!profile?.identity_image_url) {
        Alert.alert(
          "Verification Required",
          "Please complete your identity verification",
          [
            {
              text: "Verify Identity",
              onPress: () => router.replace("/profile/verify"),
            },
          ]
        );
        return;
      }
    };

    checkUserStatus();
  }, [user, profile, router]);

  // Fetch provinces and cities only once when the component first loads
  useEffect(() => {
    if (provinces.length === 0) {
      fetchProvinces();
    }

    if (cities.length === 0) {
      fetchCities();
    }
  }, [provinces, cities, fetchProvinces, fetchCities]);

  // Filter kota berdasarkan provinsi yang dipilih
  const filteredCities = cities.filter(
    (c) => c.province_id === selectedProvince
  );

  // Transform provinces to dropdown format
  const provinceData = provinces.map((prov) => ({
    label: prov.name,
    value: prov.id,
  }));

  // Transform cities to dropdown format
  const cityData = filteredCities.map((city) => ({
    label: city.name,
    value: city.id,
  }));

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    // Validasi semua field
    const validations = [
      { value: eventTitle, message: "Judul Event" },
      { value: eventDescription, message: "Deskripsi Event" },
      { value: selectedProvince, message: "Provinsi" },
      { value: selectedCity, message: "Kota" },
      { value: image, message: "Gambar Pendukung" },
      {
        value: selectedLocation.latitude && selectedLocation.longitude,
        message: "Lokasi Event",
      },
    ];

    // Cek field yang kosong
    const emptyFields = validations
      .filter((validation) => !validation.value)
      .map((validation) => validation.message);

    if (emptyFields.length > 0) {
      Alert.alert(
        "Error",
        `Harap isi field berikut:\n${emptyFields.join(", ")}`
      );
      return;
    }

    if (startDate >= endDate) {
      Alert.alert("Error", "Waktu mulai harus lebih kecil dari waktu selesai");
      return;
    } else if (startDate < new Date()) {
      Alert.alert(
        "Error",
        "Waktu mulai tidak boleh kurang dari waktu sekarang"
      );
      return;
    } else if (endDate < new Date()) {
      Alert.alert(
        "Error",
        "Waktu selesai tidak boleh kurang dari waktu sekarang"
      );
      return;
    } else if (endDate < startDate) {
      Alert.alert("Error", "Waktu selesai tidak boleh kurang dari waktu mulai");
      return;
    }

    try {
      const eventData = {
        name: eventTitle,
        description: eventDescription,
        end_date: endDate.toISOString(),
        start_date: startDate.toISOString(),
        location: {
          name: selectedLocation.name || `${selectedCity}, ${selectedProvince}`,
          latitude: selectedLocation.latitude as number,
          longitude: selectedLocation.longitude as number,
        },
        image: [image],
        city_id: selectedCity,
        province_id: selectedProvince,
      };

      const response = await createEvent(eventData);

      if (response) {
        Alert.alert("Sukses", "Event berhasil dibuat");
        router.push("/event");
      } else {
        Alert.alert("Error", "Gagal membuat event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Terjadi kesalahan saat membuat event");
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <DetailHeader title="Create Event" />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          backgroundColor: "#EEC887", // warna krem
          minHeight: Dimensions.get("window").height, // tinggi minimum agar menutup semua
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-t-3xl px-4 pt-6 pb-10">
          {/* Input Group */}
          {[
            {
              label: "Event Title",
              value: eventTitle,
              setter: setEventTitle,
              placeholder: "Festival Budaya Nusantara",
              multiline: false,
            },
            {
              label: "Event Description",
              value: eventDescription,
              setter: setEventDescription,
              placeholder: "Deskripsi acara...",
              multiline: true,
              height: "h-32",
            },
          ].map(
            ({ label, value, setter, placeholder, multiline, height }, i) => (
              <View className="mb-4" key={i}>
                <View className="flex-row items-center justify-between">
                  <Text className="mb-2 text-[#1E1E1E]">{label}</Text>
                  {label === "Event Description" && (
                    <TouchableOpacity
                      className="rounded-lg px-3 py-2 self-start mb-2 flex-row items-center"
                      style={{ backgroundColor: Colors.secondary }}
                      onPress={() => {
                        // TODO: Implement AI description generation
                        Alert.alert(
                          "Coming Soon",
                          "AI description generation is not yet implemented"
                        );
                      }}
                    >
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color="white"
                        className="mr-2"
                      />
                      <Text className="text-white text-sm">Generate</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View
                  className={`bg-white rounded-xl px-4 py-3 ${height || ""}`}
                  style={shadowStyle}
                >
                  <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="#4E7D79"
                    value={value}
                    onChangeText={setter}
                    multiline={multiline}
                    textAlignVertical="top"
                    className="text-[#1E1E1E]"
                  />
                </View>
              </View>
            )
          )}

          {/* Province Dropdown */}
          <View className="mb-4">
            <Text className="mb-2 text-[#1E1E1E]">Province</Text>
            <Dropdown
              style={[styles.dropdown, shadowStyle]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={provinceData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!provinceIsFocus ? "Pilih Provinsi" : "..."}
              searchPlaceholder="Cari Provinsi..."
              value={selectedProvince}
              onFocus={() => setProvinceIsFocus(true)}
              onBlur={() => setProvinceIsFocus(false)}
              onChange={(item) => {
                setSelectedProvince(item.value);
                setSelectedCity(""); // Reset kota saat provinsi berubah
                setSelectedLocation({}); // Kosongkan lokasi saat provinsi berubah
                setProvinceIsFocus(false);
              }}
            />
          </View>

          {/* City Dropdown */}
          <View className="mb-4">
            <Text className="mb-2 text-[#1E1E1E]">City</Text>
            <Dropdown
              style={[styles.dropdown, shadowStyle]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={cityData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={
                !selectedProvince
                  ? "Silahkan pilih provinsi terlebih dahulu"
                  : !cityIsFocus
                    ? "Pilih Kota"
                    : "..."
              }
              searchPlaceholder="Cari Kota..."
              value={selectedCity}
              onFocus={() => setCityIsFocus(true)}
              onBlur={() => setCityIsFocus(false)}
              onChange={(item) => {
                setSelectedCity(item.value);
                setSelectedLocation({}); // Kosongkan lokasi saat city berubah
                setCityIsFocus(false);
              }}
              disable={!selectedProvince}
            />
          </View>

          {/* Location Preview */}
          <View className="mb-4">
            <Text className="mb-2 text-[#1E1E1E]">Lokasi Event</Text>
            <TouchableOpacity
              onPress={() => {
                if (!selectedCity) {
                  Alert.alert(
                    "Pilih Kota",
                    "Silahkan pilih city terlebih dahulu"
                  );
                  return;
                }
                setIsFullScreenMapVisible(true);
              }}
              className="bg-white rounded-xl px-4 py-3"
              style={shadowStyle}
            >
              <Text
                className={`text-[#1E1E1E] ${!selectedCity ? "text-gray-400" : ""}`}
              >
                {!selectedCity
                  ? "Silahkan pilih city terlebih dahulu"
                  : selectedLocation.name
                    ? selectedLocation.name
                    : "Pilih Lokasi Event"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Screen Maps Modal */}
          {isFullScreenMapVisible && (
            <Maps
              isFullScreen={true}
              previousLocation={
                selectedLocation.latitude && selectedLocation.longitude
                  ? {
                      latitude: selectedLocation.latitude,
                      longitude: selectedLocation.longitude,
                      name: selectedLocation.name,
                    }
                  : undefined
              }
              initialCity={
                selectedCity
                  ? cities.find((city) => city.id === selectedCity)
                  : undefined
              }
              onLocationSelect={(location) => {
                setSelectedLocation(location);
                setIsFullScreenMapVisible(false);
              }}
              onClose={() => setIsFullScreenMapVisible(false)}
            />
          )}

          {/* Date */}
          <View className="flex-row justify-between mb-4">
            {[
              {
                label: "Tanggal Mulai",
                value: startDate,
                show: showStartDatePicker,
                setShow: setShowStartDatePicker,
                setter: setStartDate,
              },
              {
                label: "Tanggal Selesai",
                value: endDate,
                show: showEndDatePicker,
                setShow: setShowEndDatePicker,
                setter: setEndDate,
              },
            ].map((item, i) => {
              return (
                <View className="flex-1" key={i}>
                  <Text className="mb-2 text-[#1E1E1E]">{item.label}</Text>
                  <TouchableOpacity
                    onPress={() => item.setShow(true)}
                    className="bg-white rounded-xl px-4 py-3 mr-2"
                    style={shadowStyle}
                  >
                    <Text className="text-[#1E1E1E]">
                      {item.value.toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>
                  {item.show && (
                    <DatePicker
                      modal
                      mode="datetime"
                      title={item.label}
                      minimumDate={new Date()}
                      maximumDate={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() + 5)
                        )
                      }
                      locale="id-ID"
                      open={item.show}
                      date={item.value}
                      onConfirm={(date) => {
                        item.setShow(false);
                        item.setter(date);
                      }}
                      onCancel={() => {
                        item.setShow(false);
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>

          {/* Image Picker */}
          <View className="mb-4">
            <Text className="mb-2 text-[#1E1E1E]">Supporting Image</Text>
            <TouchableOpacity
              onPress={pickImage}
              className="bg-white rounded-xl h-48 justify-center items-center"
              style={shadowStyle}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="image-outline" size={48} color="#4E7D79" />
              )}
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={handleCreate}
            className="bg-[#EEC887] rounded-xl py-4 items-center mt-4"
          >
            <Text className="text-[#1E1E1E] font-bold text-lg">
              Create Event
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "white",
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    paddingHorizontal: 8,
    fontSize: 14,
    color: "gray",
  },
  selectedTextStyle: {
    paddingHorizontal: 8,
    fontSize: 16,
    color: Colors.black,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    borderRadius: 8,
    height: 40,
    fontSize: 16,
  },
});
