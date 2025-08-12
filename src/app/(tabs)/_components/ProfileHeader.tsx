import { User } from "@/types/User";
import { UserProfile } from "@/types/UserProfile";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";

export interface ProfileHeaderProps {
  profile: UserProfile | null;
  user: User | null;
}

export function ProfileHeader({ profile, user }: ProfileHeaderProps) {
  return (
    <View style={{ 
      alignItems: 'center', 
      marginBottom: 24 
    }}>
      <View style={{
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#E0E0E0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
      }}>
        <Image
          source={
            profile?.avatar_url
              ? { uri: profile.avatar_url }
              : require("@/assets/images/eksproler.png")
          }
          style={{
            width: 112,
            height: 112,
            borderRadius: 56
          }}
          placeholder={require("@/assets/images/adaptive-icon.png")}
          contentFit="cover"
          transition={300}
          priority="high"
          recyclingKey={`profile-avatar-${profile?.id || 'default'}`}
        />
      </View>
      <Text style={{ 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#1E1E1E' 
      }}>
        {profile?.fullname || "Penjelajah"}
      </Text>
      <Text style={{ 
        color: '#4E7D79', 
        opacity: 0.7 
      }}>
        {user?.email || "-"}
      </Text>
    </View>
  );
}
