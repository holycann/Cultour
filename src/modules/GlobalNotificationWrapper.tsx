import React from 'react';
import { GlobalNotificationProvider, useGlobalNotification } from './GlobalNotification';

export { GlobalNotificationProvider, useGlobalNotification };

export const withGlobalNotification = (WrappedComponent: React.ComponentType<any>) => {
  return (props: any) => (
    <GlobalNotificationProvider>
      <WrappedComponent {...props} />
    </GlobalNotificationProvider>
  );
}; 