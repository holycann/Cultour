import { LoadingButton } from '@/components/ui/LoadingButton';
import React from 'react';
import { Text, View } from 'react-native';

export interface DiscussionJoinButtonProps {
  onJoin: () => void;
  isLoading: boolean;
}

export function DiscussionJoinButton({ 
  onJoin, 
  isLoading 
}: DiscussionJoinButtonProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg text-gray-600 mb-4">
        Anda belum bergabung dalam diskusi ini
      </Text>
      <LoadingButton
        label="Bergabung"
        onPress={onJoin}
        isLoading={isLoading}
        className="px-6"
      />
    </View>
  );
} 