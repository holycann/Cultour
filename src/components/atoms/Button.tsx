import Colors from '@/constants/Colors';
import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

type ButtonProps = {
  label: string;
  onPress: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export default function Button({
  label, 
  onPress, 
  className = '', 
  style,
  labelStyle,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  const baseStyle: ViewStyle = {
    backgroundColor: disabled 
      ? Colors.buttonSecondary 
      : (variant === 'primary' ? Colors.buttonPrimary : Colors.buttonSecondary),
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
  };

  const baseLabelStyle: TextStyle = {
    color: disabled 
      ? Colors.buttonSecondaryText 
      : (variant === 'primary' ? Colors.buttonPrimaryText : Colors.buttonSecondaryText),
    fontSize: 16,
    fontWeight: '600',
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[baseStyle, style]}
      className={className}
      disabled={disabled}
    >
      <Text style={[baseLabelStyle, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
} 