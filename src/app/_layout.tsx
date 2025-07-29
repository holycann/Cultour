import { AppProvider } from "@/providers/AppProvider";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { memo } from "react";
import "./global.css";

// Navigator memoized for performance
const RootNavigator = memo(function RootNavigator() {
  return (
    <>
      <StatusBar />
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false, animation: "fade" }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="auth/register"
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="place/[id]"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="profile/edit"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="profile/verify"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="profile/badge"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="event/add"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="event/[_id]"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="event/[id]/chat/index"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="event/[id]/discussion/index"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
      </Stack>
    </>
  );
});

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
