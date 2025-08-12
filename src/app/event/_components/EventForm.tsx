import Maps from "@/components/Maps";
import Colors from "@/constants/Colors";
import { useAi } from "@/hooks/useAi";
import { useCity } from "@/hooks/useCity";
import { useProvince } from "@/hooks/useProvince";
import notify from "@/services/notificationService";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { Dropdown } from "react-native-element-dropdown";

export interface EventFormProps {
  initialData?: {
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    province?: string;
    city?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      name?: string;
    };
    image?: string;
  };
  onSubmit: (eventData: any) => Promise<boolean>;
  submitButtonText: string;
}

export function EventForm({
  initialData = {},
  onSubmit,
  submitButtonText,
}: EventFormProps) {
  const [eventTitle, setEventTitle] = useState(initialData.name || "");
  const [eventDescription, setEventDescription] = useState(
    initialData.description || ""
  );
  const [startDate, setStartDate] = useState(
    initialData.startDate || new Date()
  );
  const [endDate, setEndDate] = useState(initialData.endDate || new Date());
  const [selectedProvince, setSelectedProvince] = useState(
    initialData.province || ""
  );
  const [selectedCity, setSelectedCity] = useState(initialData.city || "");
  const [image, setImage] = useState<string | null>(initialData.image || null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude?: number;
    longitude?: number;
    name?: string;
  }>(initialData.location || {});
  const [isFullScreenMapVisible, setIsFullScreenMapVisible] = useState(false);
  const [provinceIsFocus, setProvinceIsFocus] = useState(false);
  const [cityIsFocus, setCityIsFocus] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const { fetchProvinces, allProvinces } = useProvince();
  const { fetchCities, allCities } = useCity();
  const { generateEventDescription } = useAi();

  // Fetch provinces and cities
  useEffect(() => {
    const fetchData = async () => {
      await fetchProvinces({
        pagination: { page: 1, per_page: 1000 },
        listType: "all",
      });
      await fetchCities({
        pagination: { page: 1, per_page: 1000 },
        listType: "all",
      });
    };

    fetchData();
  }, []);

  // Filter cities based on selected province
  const filteredCities = allCities.filter(
    (c) => c.province_id === selectedProvince
  );

  // Transform provinces to dropdown format
  const provinceData = allProvinces.map((prov) => ({
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

  const handleSubmit = async () => {
    // Validate all fields
    const validations = [
      { value: eventTitle, message: "Event Title" },
      { value: eventDescription, message: "Event Description" },
      { value: selectedProvince, message: "Province" },
      { value: selectedCity, message: "City" },
      { value: image, message: "Supporting Image" },
      {
        value: selectedLocation.latitude && selectedLocation.longitude,
        message: "Event Location",
      },
    ];

    // Check empty fields
    const emptyFields = validations
      .filter((validation) => !validation.value)
      .map((validation) => validation.message);

    if (emptyFields.length > 0) {
      notify.error("Incomplete Information", {
        message: `Please fill in the following fields: ${emptyFields.join(", ")}`,
      });
      return;
    }

    // Date validations
    if (startDate >= endDate) {
      notify.error("Invalid Dates", { message: "Start time must be less than end time" });
      return;
    } else if (startDate < new Date()) {
      notify.error("Invalid Dates", { message: "Start time cannot be less than current time" });
      return;
    } else if (endDate < new Date()) {
      notify.error("Invalid Dates", { message: "End time cannot be less than current time" });
      return;
    } else if (endDate < startDate) {
      notify.error("Invalid Dates", { message: "End time cannot be less than start time" });
      return;
    }

    const eventData = {
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
      image: [image],
      city_id: selectedCity,
      province_id: selectedProvince,
      is_kid_friendly: true,
    };

    try {
      const success = await onSubmit(eventData);
      if (!success) {
        notify.error("Error", { message: "Failed to submit event" });
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      notify.error("Error", { message: "An error occurred while submitting the event" });
    }
  };

  const generateAiDescription = async () => {
    // Validate required fields for AI description generation
    const validations = [
      { value: eventTitle, message: "Event Title" },
      { value: selectedProvince, message: "Province" },
      { value: selectedCity, message: "City" },
      {
        value: selectedLocation.latitude && selectedLocation.longitude,
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
      notify.error("Incomplete Information", {
        message: `Please fill in the following fields before generating description: ${emptyFields.join(", ")}`,
      });
      return;
    }

    try {
      setIsGeneratingDescription(true);
      const additionalContext = `Event will be held in ${
        allCities.find((c) => c.id === selectedCity)?.name || "selected city"
      }, ${
        allProvinces.find((p) => p.id === selectedProvince)?.name || "selected province"
      }. Event dates: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}. Location details: ${
        selectedLocation.name || "Specific location"
      }`;

      const response = await generateEventDescription({
        title: eventTitle,
        additional_context: additionalContext,
      });

      if (response?.description) {
        setEventDescription(response?.description);
        notify.success("Success", { message: "AI description generated successfully" });
      } else {
        notify.error("Error", { message: "Failed to generate description" });
      }
    } catch (error) {
      console.error("AI Description Generation Error:", error);
      notify.error("Error", { message: "Failed to generate description" });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <View>
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
          aiButton: true,
        },
      ].map(
        (
          { label, value, setter, placeholder, multiline, height, aiButton },
          i
        ) => (
          <View className="mb-4" key={i}>
            <View className="flex-row items-center justify-between">
              <Text className="mb-2 text-[#1E1E1E]">{label}</Text>
              {aiButton && (
                <TouchableOpacity
                  onPress={generateAiDescription}
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
          data={provinceData}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!provinceIsFocus ? "Select Province" : "..."}
          searchPlaceholder="Search Province..."
          value={selectedProvince}
          onFocus={() => setProvinceIsFocus(true)}
          onBlur={() => setProvinceIsFocus(false)}
          onChange={(item) => {
            setSelectedProvince(item.value);
            setSelectedCity(""); // Reset city when province changes
            setSelectedLocation({}); // Clear location when province changes
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
              ? "Please select a province first"
              : !cityIsFocus
                ? "Select City"
                : "..."
          }
          searchPlaceholder="Search City..."
          value={selectedCity}
          onFocus={() => setCityIsFocus(true)}
          onBlur={() => setCityIsFocus(false)}
          onChange={(item) => {
            setSelectedCity(item.value);
            setSelectedLocation({}); // Clear location when city changes
            setCityIsFocus(false);
          }}
          disable={!selectedProvince}
        />
      </View>

      {/* Location Preview */}
      <View className="mb-4">
        <Text className="mb-2 text-[#1E1E1E]">Event Location</Text>
        <TouchableOpacity
          onPress={() => {
            if (!selectedCity) {
              notify.info("Select City", { message: "Please select a city first" });
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
              ? "Please select a city first"
              : selectedLocation.name
                ? selectedLocation.name
                : "Select Event Location"}
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
                  new Date(new Date().setFullYear(new Date().getFullYear() + 5))
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
        ))}
      </View>

      {/* Image Picker */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ 
          marginBottom: 8, 
          color: '#1E1E1E' 
        }}>
          Supporting Image
        </Text>
        <TouchableOpacity
          onPress={pickImage}
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            height: 192,
            justifyContent: 'center',
            alignItems: 'center',
            ...shadowStyle
          }}
        >
          {image ? (
            <Image
              source={{ uri: image }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 16
              }}
              placeholder={require("@/assets/images/adaptive-icon.png")}
              contentFit="cover"
              transition={300}
              priority="high"
              recyclingKey={`event-form-image-${image}`}
            />
          ) : (
            <Ionicons name="image-outline" size={48} color="#4E7D79" />
          )}
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="bg-[#EEC887] rounded-xl py-4 items-center mt-4"
      >
        <Text className="text-[#1E1E1E] font-bold text-lg">
          {submitButtonText}
        </Text>
      </TouchableOpacity>
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

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "white",
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
    height: 40,
    fontSize: 16,
  },
});
