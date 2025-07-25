import React, { createContext, useContext, useState } from 'react';
import {
    Animated,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Tipe untuk konfigurasi notifikasi
export interface NotificationConfig {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onCancel?: () => void;
  onConfirm?: () => void;
}

// Konteks untuk manajemen notifikasi global
const GlobalNotificationContext = createContext<{
  showNotification: (config: NotificationConfig) => void;
}>({
  showNotification: () => {},
});

export const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const fadeAnim = new Animated.Value(0);

  const showNotification = (config: NotificationConfig) => {
    setNotification(config);
    setIsVisible(true);

    // Animasi masuk
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Tutup otomatis jika ada durasi
    if (config.duration) {
      setTimeout(() => {
        hideNotification();
      }, config.duration);
    }
  };

  const hideNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      setNotification(null);
    });
  };

  const handleCancel = () => {
    notification?.onCancel?.();
    hideNotification();
  };

  const handleConfirm = () => {
    notification?.onConfirm?.();
    hideNotification();
  };

  // Warna berdasarkan tipe notifikasi
  const getBackgroundColor = () => {
    switch (notification?.type) {
      case 'success': return '#4E7D79';
      case 'error': return '#FF6B6B';
      case 'warning': return '#FFC107';
      case 'info': return '#3498DB';
      default: return '#EEC887';
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="none"
    >
      <Animated.View 
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: fadeAnim,
        }}
      >
        <View 
          style={{
            width: '80%',
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
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
          {notification?.title && (
            <Text 
              style={{ 
                fontSize: 18, 
                fontWeight: 'bold', 
                marginBottom: 10,
                color: getBackgroundColor() 
              }}
            >
              {notification.title}
            </Text>
          )}
          
          <Text 
            style={{ 
              textAlign: 'center', 
              marginBottom: 20,
              color: '#4E7D79' 
            }}
          >
            {notification?.message}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity
              onPress={handleCancel}
              style={{
                backgroundColor: '#F9EFE4',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                flex: 1,
                marginRight: 10,
              }}
            >
              <Text style={{ 
                textAlign: 'center', 
                color: '#4E7D79', 
                fontWeight: 'bold' 
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                backgroundColor: getBackgroundColor(),
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 10,
                flex: 1,
              }}
            >
              <Text style={{ 
                textAlign: 'center', 
                color: 'white', 
                fontWeight: 'bold' 
              }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

// Hook untuk menggunakan notifikasi global
export const useGlobalNotification = () => {
  const context = useContext(GlobalNotificationContext);
  if (!context) {
    throw new Error('useGlobalNotification must be used within a GlobalNotificationProvider');
  }
  return context;
}; 