import Colors from "@/constants/Colors";
import { AiMessage } from "@/types/Ai";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

export interface AiMessageItemProps {
  item: AiMessage;
}

export function AiMessageItem({ item }: AiMessageItemProps) {
  // Function to format text - add line break after each period
  const formatTextWithLineBreaks = (text: string) => {
    return text.replace(/\. /g, ".\n");
  };

  return (
    <>
      {/* Display sender name */}
      <Text
        style={[
          styles.senderName,
          {
            color: Colors.black,
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 4,
            textAlign: item.is_user_message ? "right" : "left",
          },
        ]}
      >
        {item.is_user_message ? "Anda" : "Cultour AI Assistant"}
      </Text>
      <View
        style={[
          styles.messageContainer,
          {
            backgroundColor: item.is_user_message ? "#4E7D79" : "#F3DDBF",
            alignSelf: item.is_user_message ? "flex-end" : "flex-start",
            maxWidth: "85%", // Prevent messages from being too wide
            marginVertical: 4, // Add spacing between messages
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 16,
            // Add shadow for better visual separation
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: item.is_user_message ? "white" : "#1E1E1E",
              fontSize: 16, // Comfortable reading size
              lineHeight: 24, // 1.5x line height for better readability
              fontFamily: Platform.OS === "ios" ? "System" : "Roboto", // Use system fonts
              letterSpacing: 0.3, // Slight letter spacing for clarity
              textAlign: "left", // Ensure consistent alignment
            },
          ]}
          selectable={true} // Allow text selection
        >
          {formatTextWithLineBreaks(item.response[0])}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    padding: 12,
    marginVertical: 8,
    maxWidth: "80%",
    borderRadius: 16,
  },
  messageText: {
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    marginHorizontal: 4,
  },
});
