import { Typography } from "@/constants/Typography";
import React from "react";
import { Text } from "react-native";

export interface AuthTitleProps {
  title: string;
  className?: string;
}

export function AuthTitle({ title, className = "" }: AuthTitleProps) {
  return (
    <Text
      className={`mb-6 text-[#1A1A1A] text-center ${className}`}
      style={Typography.styles.title}
    >
      {title}
    </Text>
  );
}
