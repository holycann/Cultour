/**
 * Error boundary component for handling application errors gracefully
 * Catches JavaScript errors in the component tree and displays a fallback UI
 */
import { CommonColors } from "@/constants/Colors";
import { AppError, ErrorCode } from "@/types/AppError";
import { Ionicons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * Props for the ErrorBoundary component
 */
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * State for the ErrorBoundary component
 */
interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree
 * and display a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Static method to update state when an error occurs
   * @param error The error that was thrown
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error occurs
   * @param error The error that was thrown
   * @param errorInfo Information about the component stack
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  /**
   * Reset the error state to recover from the error
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI provided via props
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Format the error
      let errorMessage = "An unexpected error occurred";
      let errorCode = ErrorCode.UNKNOWN_ERROR;

      if (this.state.error instanceof AppError) {
        errorMessage = this.state.error.message;
        errorCode = this.state.error.code;
      } else if (this.state.error) {
        errorMessage = this.state.error.message || errorMessage;
      }

      // Default fallback UI
      return (
        <View className="flex-1 items-center justify-center p-5 bg-white">
          <View className="mb-5">
            <Ionicons
              name="alert-circle-outline"
              size={60}
              color={CommonColors.error}
            />
          </View>

          <Text className="text-2xl font-bold mb-2.5 text-gray-900">
            Oops, Something Went Wrong
          </Text>
          <Text className="text-base mb-5 text-gray-700 text-center">
            We&apos;re sorry for the inconvenience.
          </Text>

          <View className="bg-gray-100 p-4 rounded-lg mb-5 w-full">
            <Text className="text-xs text-gray-500 mb-1.5 font-mono">
              [{errorCode}]
            </Text>
            <Text className="text-sm text-gray-800 font-mono">
              {errorMessage}
            </Text>
          </View>

          <TouchableOpacity
            className="flex-row items-center bg-primary py-2.5 px-5 rounded-lg"
            onPress={this.resetError}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={CommonColors.white}
              className="mr-2"
            />
            <Text className="text-base font-medium text-white">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
