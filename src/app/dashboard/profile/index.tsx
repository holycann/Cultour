import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { deleteUserById, getAllUsers } from "../../../store/userAPI";

export default function ProfileScreen() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(getAllUsers());
  }, []);

  // Untuk refresh setelah delete
  function handleDelete(id) {
    deleteUserById(id);
    setUsers(getAllUsers());
    Alert.alert("Deleted", "User berhasil dihapus");
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 20 }}
    >
      <Text className="text-xl font-bold mb-4">Data Penjelajah</Text>
      {users.length === 0 && (
        <Text className="text-gray-500">Belum ada penjelajah terdaftar.</Text>
      )}
      {users.map((user) => (
        <View
          key={user.id}
          className="flex-row items-center justify-between border-b border-gray-200 py-3"
        >
          <View>
            <Text className="font-bold">{user.name}</Text>
            <Text className="text-gray-500">{user.email}</Text>
          </View>
          <Pressable
            className="bg-red-500 px-4 py-2 rounded-xl"
            onPress={() => handleDelete(user.id)}
          >
            <Text className="text-white font-bold">Hapus</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
