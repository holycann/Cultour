import React from "react";
import { StyleProp, TextStyle, ViewStyle } from "react-native";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfigParams,
  ToastPosition,
} from "react-native-toast-message";
import Colors from "../../constants/Colors";

// Define more comprehensive toast types
export type ToastType = "success" | "error" | "info" | "custom";

// Enhanced toast configuration interface
export interface CustomToastConfig {
  text1?: string;
  text2?: string;
  onPress?: () => void;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: {
    text1?: StyleProp<TextStyle>;
    text2?: StyleProp<TextStyle>;
  };
}

// Advanced toast configuration
const toastConf = {
  // Highly customizable success toast
  success: ({ text1, text2, props }: ToastConfigParams<CustomToastConfig>) => (
    <BaseToast
      style={[
        {
          borderLeftColor: Colors.primary,
          backgroundColor: Colors.backgroundDefault,
          borderRadius: 10,
        },
        props?.style,
      ]}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={[
        {
          fontSize: 16,
          fontWeight: "bold",
          color: Colors.textPrimary,
        },
        props?.textStyle?.text1,
      ]}
      text2Style={[
        {
          fontSize: 14,
          color: Colors.textSecondary,
        },
        props?.textStyle?.text2,
      ]}
      text1={text1}
      text2={text2}
      onPress={props?.onPress}
    />
  ),

  // Enhanced error toast with more visual feedback
  error: ({ text1, text2, props }: ToastConfigParams<CustomToastConfig>) => (
    <ErrorToast
      style={[
        {
          borderLeftColor: Colors.error,
          backgroundColor: Colors.backgroundDefault,
          borderRadius: 10,
        },
        props?.style,
      ]}
      text1Style={[
        {
          fontSize: 16,
          fontWeight: "bold",
          color: Colors.error,
        },
        props?.textStyle?.text1,
      ]}
      text2Style={[
        {
          fontSize: 14,
          color: Colors.textSecondary,
        },
        props?.textStyle?.text2,
      ]}
      text1={text1}
      text2={text2}
      onPress={props?.onPress}
    />
  ),

  // Custom toast for maximum flexibility
  custom: ({ text1, text2, props }: ToastConfigParams<CustomToastConfig>) => (
    <BaseToast
      style={[
        {
          backgroundColor: Colors.backgroundDefault,
          borderRadius: 10,
          padding: 15,
          width: "90%",
          alignSelf: "center",
        },
        props?.style,
      ]}
      text1Style={[
        {
          fontSize: 16,
          fontWeight: "bold",
          marginBottom: 5,
          color: Colors.textPrimary,
        },
        props?.textStyle?.text1,
      ]}
      text2Style={[
        {
          fontSize: 14,
          color: Colors.textSecondary,
        },
        props?.textStyle?.text2,
      ]}
      text1={text1}
      text2={text2}
      onPress={props?.onPress}
    />
  ),
};

// Enhanced Toast Utility Functions
export const ToastUtils = {
  /**
   * Show a toast message with advanced configuration
   * @param type Toast type
   * @param text1 Primary message text
   * @param options Advanced toast configuration options
   */
  show: (
    type: ToastType,
    text1: string,
    options: CustomToastConfig & {
      text2?: string;
      position?: ToastPosition;
      duration?: number;
    } = {}
  ) => {
    const { text2, position = "top", duration = 3000, ...restProps } = options;

    // Regular toast handling
    Toast.show({
      type,
      text1,
      text2,
      position,
      visibilityTime: duration,
      autoHide: true,
      topOffset: 50,
      bottomOffset: 50,
      props: restProps,
    });
  },

  // Shorthand methods with default configurations
  success: (text1: string, options: CustomToastConfig = {}) =>
    ToastUtils.show("success", text1, options),

  error: (text1: string, options: CustomToastConfig = {}) =>
    ToastUtils.show("error", text1, options),

  info: (text1: string, options: CustomToastConfig = {}) =>
    ToastUtils.show("info", text1, options),

  // Utility to hide all toasts
  hideAll: () => Toast.hide(),
};

// Export for use in App component
export { Toast, toastConf };
