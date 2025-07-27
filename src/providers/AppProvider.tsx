import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Import all providers
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

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Main application provider that combines all context providers
 * This ensures proper context hierarchy and organization
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <ThreadProvider>
            <MessageProvider>
              <LocationProvider>
                <EventProvider>
                  <CityProvider>
                    <BadgeProvider>
                      <ProvinceProvider>
                        <GestureHandlerRootView style={{ flex: 1 }}>
                          {children}
                        </GestureHandlerRootView>
                      </ProvinceProvider>
                    </BadgeProvider>
                  </CityProvider>
                </EventProvider>
              </LocationProvider>
            </MessageProvider>
          </ThreadProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};
