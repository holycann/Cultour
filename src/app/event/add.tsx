import DetailHeader from "@/app/components/DetailHeader";
import { useEvent } from "@/hooks/useEvent";
import { Dimensions } from "react-native";

import { Ionicons } from "@expo/vector-icons";
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
    if (!eventTitle || !eventDescription || !province || !city || !image) {
      Alert.alert("Error", "Harap isi semua field");
      return;
    }

    try {
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
    <View className="flex-1 bg-[#EEC887]">
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
            {
              label: "Province",
              value: province,
              setter: setProvince,
              placeholder: "West Java",
            },
            {
              label: "City",
              value: city,
              setter: setCity,
              placeholder: "Bandung",
            },
          ].map(
            ({ label, value, setter, placeholder, multiline, height }, i) => (
              <View className="mb-4" key={i}>
                <Text className="mb-2 text-[#1E1E1E]">{label}</Text>
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

          {/* Date */}
          <View className="flex-row justify-between mb-4">
            {[
              {
                label: "Start Date",
                value: startDate,
                show: showStartDatePicker,
                setShow: setShowStartDatePicker,
                setter: setStartDate,
              },
              {
                label: "End Date",
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
                    {item.value.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
                {item.show && (
                  <DateTimePicker
                    value={item.value}
                    mode="date"
                    display="default"
                    onChange={(e, date) => {
                      item.setShow(Platform.OS === "ios");
                      if (date) item.setter(date);
                    }}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Time */}
          <View className="flex-row justify-between mb-4">
            {[
              {
                label: "Start Time",
                value: startTime,
                show: showStartTimePicker,
                setShow: setShowStartTimePicker,
                setter: setStartTime,
              },
              {
                label: "End Time",
                value: endTime,
                show: showEndTimePicker,
                setShow: setShowEndTimePicker,
                setter: setEndTime,
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
                    {item.value.toLocaleTimeString()}
                  </Text>
                </TouchableOpacity>
                {item.show && (
                  <DateTimePicker
                    value={item.value}
                    mode="time"
                    display="default"
                    onChange={(e, time) => {
                      item.setShow(Platform.OS === "ios");
                      if (time) item.setter(time);
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
            onPress={handleNext}
            className="bg-[#EEC887] rounded-xl py-4 items-center mt-4"
          >
            <Text className="text-[#1E1E1E] font-bold text-lg">Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
};
