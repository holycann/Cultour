import DetailHeader from "@/app/components/DetailHeader";
import Maps from "@/components/Maps";
import { useCity } from "@/hooks/useCity";
import { useEvent } from "@/hooks/useEvent";
import { useProvince } from "@/hooks/useProvince";
import { useUser } from "@/hooks/useUser";
import * as FileSystem from "expo-file-system";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";

import Colors from "@/constants/Colors";
import { useAi } from "@/hooks/useAi";
import { useAuth } from "@/hooks/useAuth";

export default function EditEventScreen() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { profile } = useUser();
  const { user } = useAuth();

  const { event, getEventById, updateEvent } = useEvent();
  const { allProvinces, fetchProvinces } = useProvince();
  const { allCities, fetchCities } = useCity();
  const { generateEventDescription } = useAi();

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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Cek status autentikasi dan verifikasi
  useEffect(() => {
    const checkUserStatus = async () => {
      // Cek apakah user sudah login
      if (!user) {
        Alert.alert("Login Required", "Please login to edit an event", [
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

  // Fetch event details when screen loads
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (eventId) {
        if (!event || event.id !== eventId) {
          await getEventById(eventId);
        }

        if (event) {
          // Populate form with existing event data
          setEventTitle(event.name || "");
          setEventDescription(event.description || "");

          // Set dates and times
          if (event.start_date) {
            const startDateTime = new Date(event.start_date);
            setStartDate(startDateTime);
          }

          if (event.end_date) {
            const endDateTime = new Date(event.end_date);
            setEndDate(endDateTime);
          }

          // Set province and city
          if (event?.location?.city?.province_id) {
            setSelectedProvince(event?.location?.city?.province_id || "");
          }

          if (event?.location?.city_id) {
            setSelectedCity(event?.location?.city_id || "");
          }

          // Set image
          if (event.image_url) {
            const fileUri = FileSystem.documentDirectory + event.id + ".jpg";

            // Check if file already exists before downloading
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            let downloadedFile;

            if (!fileInfo.exists) {
              downloadedFile = await FileSystem.downloadAsync(
                event.image_url,
                fileUri
              );
            } else {
              downloadedFile = { uri: fileUri };
            }
            setImage(downloadedFile.uri);
          }

          // Set location
          if (event.location) {
            setSelectedLocation({
              latitude: event.location.latitude,
              longitude: event.location.longitude,
              name: event.location.name,
            });
          }
        }
      }
    };

    fetchEventDetails();
  }, [eventId, event]);

  // Fetch provinces and cities only once when the component first loads
  useEffect(() => {
    fetchProvinces({
      pagination: { page: 1, per_page: 1000 },
      listType: "all",
    });
    fetchCities({
      pagination: { page: 1, per_page: 1000 },
      listType: "all",
    });
  }, []);

  // Filter kota berdasarkan provinsi yang dipilih
  const filteredCities = allCities.filter(
    (c) => c.province_id === selectedProvince
  );

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
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
        id: eventId,
        name: eventTitle,
        description: eventDescription,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        location: {
          name: selectedLocation.name || `${selectedCity}, ${selectedProvince}`,
          latitude: selectedLocation.latitude as number,
          longitude: selectedLocation.longitude as number,
          city_id: selectedCity,
        },
        image:
          image?.split("/").pop()?.split(".")[0] ===
          event?.image_url?.split("/").pop()?.split(".")[0]
            ? [""]
            : [image],
        province_id: selectedProvince,
        location_id: event?.location?.id || "",
        image_url: event?.image_url || "",
        is_kid_friendly: event?.is_kid_friendly || false,
        Location: event?.location || {
          name: "",
          latitude: 0,
          longitude: 0,
          city_id: "",
        },
      };

      const response = await updateEvent(eventData);

      if (response) {
        Alert.alert("Sukses", "Event berhasil diperbarui");
        router.push(`/event/${eventId}`);
      } else {
        Alert.alert("Error", "Gagal memperbarui event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      Alert.alert("Error", "Terjadi kesalahan saat memperbarui event");
    }
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-[#EEC887]"
    >
      <DetailHeader title="Edit Event" />

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
                      onPress={() => {
                        // Validate required fields for AI description generation
                        const validations = [
                          { value: eventTitle, message: "Event Title" },
                          { value: selectedProvince, message: "Province" },
                          { value: selectedCity, message: "City" },
                          {
                            value:
                              selectedLocation.latitude &&
                              selectedLocation.longitude,
                            message: "Event Location",
                          },
                          {
                            value: startDate && endDate,
                            message: "Event Dates",
                          },
                        ];

                        // Check field that are empty
                        const emptyFields = validations
                          .filter((validation) => !validation.value)
                          .map((validation) => validation.message);

                        if (emptyFields.length > 0) {
                          Alert.alert(
                            "Incomplete Information",
                            `Please fill in the following fields before generating description:\n${emptyFields.join(", ")}`
                          );
                          return;
                        }

                        const generateAiDescription = async () => {
                          try {
                            setIsGeneratingDescription(true);
                            const additionalContext = `Event will be held in ${allCities.find((c) => c.id === selectedCity)?.name || "selected city"}, ${allProvinces.find((p) => p.id === selectedProvince)?.name || "selected province"}. Event dates: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. Location details: ${selectedLocation.name || "Specific location"}`;

                            const response = await generateEventDescription({
                              title: eventTitle,
                              additional_context: additionalContext,
                            });

                            if (response?.description) {
                              setEventDescription(response?.description);
                              Alert.alert(
                                "Success",
                                "AI description generated successfully"
                              );
                            } else {
                              Alert.alert(
                                "Error",
                                "Failed to generate description"
                              );
                            }
                          } catch (error) {
                            console.error(
                              "AI Description Generation Error:",
                              error
                            );
                            Alert.alert(
                              "Error",
                              "Failed to generate description"
                            );
                          } finally {
                            setIsGeneratingDescription(false);
                          }
                        };

                        generateAiDescription();
                      }}
                      className="rounded-lg px-3 py-2 self-start mb-2 flex-row items-center"
                      style={{ backgroundColor: Colors.secondary }}
                      disabled={isGeneratingDescription}
                    >
                      <Ionicons
                        name="sparkles"
                        size={16}
                        color="white"
                        className="mr-2"
                      />
                      <Text className="text-white text-sm">
                        {isGeneratingDescription ? "Generating..." : "Generate"}
                      </Text>
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
              data={allProvinces.map((p) => ({ label: p.name, value: p.id }))}
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
              data={filteredCities.map((c) => ({ label: c.name, value: c.id }))}
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
                  ? allCities.find((city) => city.id === selectedCity)
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
            ].map((item, i) => (
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
                    open={item.show}
                    date={item.value}
                    locale="id-ID"
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
            ))}
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
            onPress={handleUpdate}
            className="bg-[#EEC887] rounded-xl py-4 items-center mt-4"
          >
            <Text className="text-[#1E1E1E] font-bold text-lg">
              Update Event
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
