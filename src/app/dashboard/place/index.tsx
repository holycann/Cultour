import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const places = [
  {
    id: 1,
    name: "Bandung",
    region: "Jawa Barat",
    image: require("../../../assets/images/logoHeader.png"),
  },
  {
    id: 2,
    name: "Bandung",
    region: "Jawa Barat",
    image: require("../../../assets/images/logoHeader.png"),
  },
  {
    id: 3,
    name: "Bandung",
    region: "Jawa Barat",
    image: require("../../../assets/images/logoHeader.png"),
  },
  {
    id: 4,
    name: "Bandung",
    region: "Jawa Barat",
    image: require("../../../assets/images/logoHeader.png"),
  },
  {
    id: 5,
    name: "Bandung",
    region: "Jawa Barat",
    image: require("../../../assets/images/logoHeader.png"),
  },
];

export default function PlaceScreen() {
  function handlePress(place) {
    console.log("Clicked:", place);
    // Navigasi ke detail nanti di sini
  }

  return (
    <View className="flex-1 bg-[#222] pt-3">
      {/* Title */}
      <Text className="font-bold text-xl text-[#212121] ml-7 mb-3 mt-2">
        Place
      </Text>

      <FlatList
        data={places}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            activeOpacity={0.8}
            className="flex-row items-center mx-5 mb-5"
          >
            {/* Gambar Kiri */}
            <Image
              source={item.image}
              className="w-[70px] h-[70px] rounded-xl bg-zinc-200 mr-[-22px] z-10 border-4 border-white"
            />

            {/* Card Kanan */}
            <View className="flex-1 bg-[#EEC887] rounded-2xl flex-row items-center justify-between -ml-3 px-5 py-4 shadow-md">
              <View>
                <Text className="font-bold text-base text-[#222]">
                  {item.name}
                </Text>
                <Text className="text-[#222] opacity-70 text-sm">
                  {item.region}
                </Text>
              </View>
              {/* Icon panah kanan */}
              <Text className="text-2xl text-[#4E7D79] font-bold">{">"}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
