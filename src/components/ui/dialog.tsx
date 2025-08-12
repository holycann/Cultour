import React from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Colors from "../../constants/Colors";
import { CustomToastConfig } from "./toast";

// Extended dialog configuration
export interface DialogConfig extends CustomToastConfig {
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  duration?: number;
  singleButton?: boolean; // New property to indicate single-button mode
}

// Dialog utility functions
export const DialogUtils = {
  /**
   * Show a dialog with custom actions
   * @param text1 Primary title text
   * @param options Dialog configuration options
   */
  show: (
    text1: string,
    options: DialogConfig & {
      text2?: string;
    } = {}
  ) => {
    const {
      text2,
      onConfirm,
      onCancel,
      confirmText = "Confirm",
      cancelText = "Cancel",
      duration = 5,
      singleButton = false,
      ...restProps
    } = options;

    // Forcefully reset any existing toasts
    Toast.hide();

    Toast.show({
      type: "dialog",
      text1,
      text2,
      props: {
        onConfirm,
        onCancel,
        confirmText,
        cancelText,
        singleButton,
        ...restProps,
      },
      position: "top",
      visibilityTime: duration,
      autoHide: false,
    });
  },

  // Utility to hide dialog with multiple methods
  hide: () => {
    try {
      Toast.hide();
    } catch (error) {
      console.error("Error hiding toast:", error);
    }

    // Additional fallback method
    try {
      // Attempt to programmatically dismiss all toasts
      Toast.show({
        type: "info",
        text1: "Dismiss",
        visibilityTime: 1,
        autoHide: true,
      });
    } catch (dismissError) {
      console.error("Error in fallback dismiss:", dismissError);
    }
  },
};

// Dialog configuration for Toast
export const dialogConfig = {
  dialog: ({
    text1,
    text2,
    props,
  }: {
    text1?: string;
    text2?: string;
    props?: DialogConfig;
  }) => {
    // Determine if it's a single-button dialog
    const isSingleButton =
      props?.singleButton ||
      (!props?.onConfirm && props?.onCancel) ||
      (props?.onConfirm && !props?.onCancel);

    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={true}
        // Prevent closing the modal if it's a single-button dialog
        onRequestClose={isSingleButton ? () => {} : DialogUtils.hide}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          // Prevent outside press if it's a single-button dialog
          onPress={isSingleButton ? () => {} : DialogUtils.hide}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Prevent touch events from propagating to the background */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                width: "80%",
                backgroundColor: "white",
                borderRadius: 10,
                padding: 20,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              {text1 && (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    marginBottom: 10,
                    color: Colors.textPrimary,
                    textAlign: "center",
                  }}
                >
                  {text1}
                </Text>
              )}
              {text2 && (
                <Text
                  style={{
                    fontSize: 16,
                    marginBottom: 20,
                    textAlign: "center",
                    color: Colors.textSecondary,
                  }}
                >
                  {text2}
                </Text>
              )}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: isSingleButton ? "center" : "space-between",
                }}
              >
                {/* Two-button scenario */}
                {!isSingleButton && (
                  <TouchableOpacity
                    onPress={() => {
                      // Multiple methods to hide toast
                      DialogUtils.hide();

                      // Platform-specific additional hiding
                      if (Platform.OS === "ios") {
                        setTimeout(() => {
                          DialogUtils.hide();
                        }, 50);
                      }

                      // Then call custom onCancel if provided
                      try {
                        if (props?.onCancel) {
                          props.onCancel();
                        }
                      } catch (error) {
                        console.error("Error in onCancel:", error);
                      }
                    }}
                    style={{
                      backgroundColor: Colors.primary,
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 5,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: Colors.black, fontWeight: "bold" }}>
                      {props?.cancelText || "Cancel"}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Single or Confirm button */}
                <TouchableOpacity
                  onPress={() => {
                    // Multiple methods to hide toast
                    DialogUtils.hide();

                    // Platform-specific additional hiding
                    if (Platform.OS === "ios") {
                      setTimeout(() => {
                        DialogUtils.hide();
                      }, 50);
                    }

                    // Then call custom onConfirm or onCancel
                    try {
                      if (isSingleButton) {
                        // If single button, prefer onConfirm, fallback to onCancel
                        (props?.onConfirm || props?.onCancel)?.();
                      } else {
                        props?.onConfirm?.();
                      }
                    } catch (error) {
                      console.error("Error in onConfirm/onCancel:", error);
                    }
                  }}
                  style={{
                    backgroundColor: isSingleButton
                      ? Colors.primary
                      : Colors.error,
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    marginLeft: isSingleButton ? 0 : 10,
                  }}
                >
                  <Text
                    style={{
                      color: isSingleButton ? Colors.black : "white",
                      fontWeight: "bold",
                    }}
                  >
                    {isSingleButton
                      ? props?.confirmText || props?.cancelText || "OK"
                      : props?.confirmText || "Confirm"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  },
};

export default DialogUtils;
