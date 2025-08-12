import { CameraIcon } from "@/components/ui/CameraIcon";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

export interface ProfileImagePickerProps {
  profileImage: string | null;
  onPickImage: () => void;
  disabled?: boolean;
}

export function ProfileImagePicker({ 
  profileImage, 
  onPickImage, 
  disabled = false 
}: ProfileImagePickerProps) {
  return (
    <View className="items-center mb-6">
      <TouchableOpacity 
        onPress={onPickImage}
        disabled={disabled}
        className="relative"
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            className="w-32 h-32 rounded-full"
            style={{ opacity: disabled ? 0.5 : 1 }}
          />
        ) : (
          <View 
            className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center"
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            <CameraIcon />
          </View>
        )}
        
        {!disabled && (
          <View 
            className="absolute bottom-0 right-0 bg-[#EEC887] w-10 h-10 rounded-full 
            items-center justify-center border-2 border-white"
          >
            <CameraIcon size={20} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
