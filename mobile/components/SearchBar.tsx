import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SearchBarProps {
  onSearch: (query: string, platform: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('amazon');
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim(), selectedPlatform);
    }
  };

  const togglePlatform = () => {
    setSelectedPlatform(selectedPlatform === 'amazon' ? 'flipkart' : 'amazon');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { borderColor: tintColor }]}>
        <TouchableOpacity onPress={togglePlatform} style={styles.platformButton}>
          <ThemedText type="defaultSemiBold" style={styles.platformText}>
            {selectedPlatform === 'amazon' ? 'Amazon' : 'Flipkart'}
          </ThemedText>
          <IconSymbol name="chevron.down" size={12} color={tintColor} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Search products..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        
        <TouchableOpacity 
          onPress={handleSearch}
          disabled={isLoading}
          style={[styles.searchButton, { backgroundColor: tintColor }]}
        >
          <IconSymbol
            name={isLoading ? "arrow.clockwise" : "magnifyingglass"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    height: 44,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  platformText: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
