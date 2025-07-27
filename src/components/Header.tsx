import Colors from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import SearchBar from './SearchBar';

type HeaderProps = {
  title?: string;
  showSearch?: boolean;
  hidden?: boolean;
  onSearch?: (query: string) => void;
};

export default function Header({
  title = 'Cultour',
  showSearch = true,
  hidden = false,
  onSearch
}: HeaderProps) {
  if (hidden) {
    return null;
  }

  return (
    <View style={styles.header}>
      {showSearch && (
        <SearchBar 
          placeholder={title} 
          onSearch={onSearch} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 24,
  },
});
