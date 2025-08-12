import { Message } from "@/types/Message";
import { Image } from "expo-image";
import React, { useMemo } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface MessageItemProps {
  item: Message;
  currentUserId?: string;
  onLongPress: (message: Message) => void;
}

export function MessageItem({
  item,
  currentUserId,
  onLongPress,
}: MessageItemProps) {
  const isCurrentUser =
    item.sender_id === currentUserId || item.sender?.id === currentUserId;

  const displayName = isCurrentUser
    ? "Anda"
    : (item as any)?.sender?.fullname ||
      (item as any)?.sender?.email ||
      "Pengguna Lain";

  const timeStr = (() => {
    try {
      const d = item.created_at ? new Date(item.created_at) : new Date();
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  })();

  // Derive avatar placeholder (initials + color) for non-current users
  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const second = parts[1]?.[0] || "";
    return `${first}${second}`.toUpperCase();
  }, [displayName]);

  const avatarColor = useMemo(() => {
    const palette = [
      "EEC887",
      "F3DDBF",
      "D1E8E4",
      "CFE8FF",
      "FFE6CC",
      "E7D4FF",
      "FADADD",
    ]; // light backgrounds
    const sid = String(item.sender?.id || "0");
    const sum = sid.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return palette[sum % palette.length];
  }, [item.sender?.id]);

  const avatarUrl = `https://placehold.co/48x48/${avatarColor}/333.jpg?text=${encodeURIComponent(initials)}`;

  return (
    <TouchableOpacity 
      onLongPress={() => onLongPress(item)} 
      activeOpacity={0.7}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 8,
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
      }}>
        {!isCurrentUser && (
          <Image
            source={{ uri: (item.sender as any)?.avatar_url || avatarUrl }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              marginRight: 8
            }}
            placeholder={require("@/assets/images/adaptive-icon.png")}
            contentFit="cover"
            transition={300}
            priority="low"
            recyclingKey={`avatar-${item.sender?.id}`}
          />
        )}
        <View style={{ 
          alignItems: isCurrentUser ? 'flex-end' : 'flex-start' 
        }}>
          <Text style={{ 
            fontSize: 11, 
            color: 'gray', 
            marginBottom: 4 
          }}>
            {isCurrentUser
              ? `${timeStr} • ${displayName}`
              : `${displayName} • ${timeStr}`}
          </Text>
          <View style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: isCurrentUser ? '#4E7D79' : '#EEC887',
            borderBottomRightRadius: isCurrentUser ? 0 : 16,
            borderBottomLeftRadius: !isCurrentUser ? 0 : 16,
            minWidth: 60,
            maxWidth: '100%'
          }}>
            <Text style={{
              fontSize: 14,
              lineHeight: 20,
              color: isCurrentUser ? 'white' : 'black',
              flexShrink: 1
            }}>
              {item.content}
            </Text>
          </View>
        </View>
        {isCurrentUser && (
          <Image
            source={require("@/assets/images/icon.png")}
            style={{
              width: 24,
              height: 24,
              marginLeft: 8
            }}
            placeholder={require("@/assets/images/adaptive-icon.png")}
            contentFit="contain"
            transition={300}
            priority="low"
            recyclingKey="current-user-icon"
          />
        )}
      </View>
    </TouchableOpacity>
  );
}
