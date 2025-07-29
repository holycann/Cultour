import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import all providers
import { AiProvider } from "./AiProvider";
import { AuthProvider } from "./AuthProvider";
import { BadgeProvider } from "./BadgeProvider";
import { CityProvider } from "./CityProvider";
import { EventProvider } from "./EventProvider";
import { LocationProvider } from "./LocationProvider";
import { MessageProvider } from "./MessageProvider";
import { ProvinceProvider } from "./ProvinceProvider";
import { ThreadProvider } from "./ThreadProvider";
import { UserProvider } from "./UserProvider";

import { ErrorBoundary } from "./ErrorBoundary";

import { SafeAreaProvider } from "react-native-safe-area-context";

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Main application provider that combines all context providers
 * This ensures proper context hierarchy and organization
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  useEffect(() => {
    console.log("AppProvider: Mounted");
    return () => {
      console.log("AppProvider: Unmounted");
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AuthProvider>
            <UserProvider>
              <ThreadProvider>
                <MessageProvider>
                  <LocationProvider>
                    <EventProvider>
                      <CityProvider>
                        <BadgeProvider>
                          <ProvinceProvider>
                            <AiProvider>
                              {children}
                            </AiProvider>
                          </ProvinceProvider>
                        </BadgeProvider>
                      </CityProvider>
                    </EventProvider>
                  </LocationProvider>
                </MessageProvider>
              </ThreadProvider>
            </UserProvider>
          </AuthProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
};
