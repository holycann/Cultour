import { useEvent } from "@/hooks/useEvent";
import { Icon } from "@iconify/react";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    Image,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AddEventScreen() {
  const router = useRouter();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const { createEvent } = useEvent();

  const handleGoBack = () => {
    router.back();
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    // Validasi input
    if (!eventTitle || !eventDescription || !province || !city || !image) {
      Alert.alert("Error", "Harap isi semua field");
      return;
    }

    try {
      // Contoh pengiriman data event (sesuaikan dengan backend Anda)
      const eventData = {
        title: eventTitle,
        description: eventDescription,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: `${city}, ${province}`,
        images: [image],
      };

      const response = await createEvent(eventData);

      if (response) {
        Alert.alert("Sukses", "Event berhasil dibuat");
        router.push("/dashboard/event");
      } else {
        Alert.alert("Error", "Gagal membuat event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Terjadi kesalahan saat membuat event");
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: "#F9EFE4" }}>
      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={handleGoBack} className="mr-4">
          <Text className="text-[#4E7D79] text-lg">{"<"}</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-[#4E7D79]">Create Event</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100, // Tambahkan padding bawah yang lebih besar
        }}
        keyboardShouldPersistTaps="handled" // Memungkinkan sentuhan di luar input untuk menutup keyboard
        showsVerticalScrollIndicator={false} // Sembunyikan scrollbar vertikal
      >
        {/* Event Title */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79]">Event Title</Text>
          <View
            className="bg-white rounded-xl px-4 py-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <TextInput
              placeholder="Festival Budaya Nusantara"
              placeholderTextColor="#4E7D79"
              value={eventTitle}
              onChangeText={setEventTitle}
              className="text-[#4E7D79]"
            />
          </View>
        </View>

        {/* Event Description */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79]">Event Description</Text>
          <View
            className="bg-white rounded-xl px-4 py-3 h-32"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <TextInput
              placeholder="Festival Budaya Nusantara adalah perayaan keragaman budaya Indonesia yang menghadirkan pertunjukan seni tradisional, kuliner khas daerah, pameran kerjainan lokal, serta diskusi budaya interaktif. Pengunjung juga bisa berinteraksi dengan AI Budaya dan komunitas budaya lainnya."
              placeholderTextColor="#4E7D79"
              value={eventDescription}
              onChangeText={setEventDescription}
              multiline
              textAlignVertical="top"
              className="text-[#4E7D79]"
            />
          </View>
        </View>

        {/* Date Inputs */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="mb-2 text-[#4E7D79]">Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              className="bg-white rounded-xl px-4 py-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-[#4E7D79]">
                {startDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === "ios");
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
            )}
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-2 text-[#4E7D79]">End Date</Text>
            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              className="bg-white rounded-xl px-4 py-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-[#4E7D79]">
                {endDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(Platform.OS === "ios");
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}
          </View>
        </View>

        {/* Time Inputs */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="mb-2 text-[#4E7D79]">Start Time</Text>
            <TouchableOpacity
              onPress={() => setShowStartTimePicker(true)}
              className="bg-white rounded-xl px-4 py-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-[#4E7D79]">
                {startTime.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowStartTimePicker(Platform.OS === "ios");
                  if (selectedTime) setStartTime(selectedTime);
                }}
              />
            )}
          </View>
          <View className="flex-1 ml-2">
            <Text className="mb-2 text-[#4E7D79]">End Time</Text>
            <TouchableOpacity
              onPress={() => setShowEndTimePicker(true)}
              className="bg-white rounded-xl px-4 py-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text className="text-[#4E7D79]">
                {endTime.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowEndTimePicker(Platform.OS === "ios");
                  if (selectedTime) setEndTime(selectedTime);
                }}
              />
            )}
          </View>
        </View>

        {/* Province Input */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79]">Province</Text>
          <View
            className="bg-white rounded-xl px-4 py-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <TextInput
              placeholder="West Java"
              placeholderTextColor="#4E7D79"
              value={province}
              onChangeText={setProvince}
              className="text-[#4E7D79]"
            />
          </View>
        </View>

        {/* City Input */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79]">City</Text>
          <View
            className="bg-white rounded-xl px-4 py-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <TextInput
              placeholder="Bandung"
              placeholderTextColor="#4E7D79"
              value={city}
              onChangeText={setCity}
              className="text-[#4E7D79]"
            />
          </View>
        </View>

        {/* Supporting Image */}
        <View className="mb-4">
          <Text className="mb-2 text-[#4E7D79]">Supporting Image</Text>
          <TouchableOpacity
            onPress={pickImage}
            className="bg-white rounded-xl h-48 justify-center items-center"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            {image ? (
              <Image
                source={{ uri: image }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <Icon
                icon="mdi:image-plus"
                width={48}
                height={48}
                color="#4E7D79"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <View className="pb-10 px-4">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-[#EEC887] rounded-xl py-4 items-center"
          >
            <Text className="text-[#4E7D79] font-bold text-lg">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
