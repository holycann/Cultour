import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 3,
  elevation: 2,
};

export interface IdentityUploaderProps {
  idDocument: ImagePicker.ImagePickerAsset | null;
  onPickDocument: () => Promise<void>;
}

export function IdentityUploader({
  idDocument,
  onPickDocument,
}: IdentityUploaderProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ 
        marginBottom: 8, 
        color: '#4E7D79', 
        fontWeight: '600' 
      }}>
        Upload ID Document
      </Text>
      <TouchableOpacity
        onPress={onPickDocument}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          height: 192,
          justifyContent: 'center',
          alignItems: 'center',
          ...shadowStyle
        }}
      >
        {idDocument ? (
          <Image
            source={{ uri: idDocument.uri }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 16
            }}
            placeholder={require("@/assets/images/adaptive-icon.png")}
            contentFit="cover"
            transition={300}
            priority="high"
            recyclingKey={`identity-document-${idDocument.uri}`}
          />
        ) : (
          <Text style={{ color: '#4E7D79' }}>
            Upload ID Document
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
