import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('amazon'); // 'amazon' or 'flipkart'
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    
    // Navigate to the appropriate search screen based on selected platform
    const screenName = selectedPlatform === 'amazon' ? 'AmazonSearch' : 'FlipkartSearch';
    navigation.navigate(screenName, { searchQuery });
    
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="auto" />
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Shopping Assistant</Text>
          <Text style={styles.subtitle}>Search across multiple platforms</Text>
        </View>
        
        {/* Platform Selection */}
        <View style={styles.platformContainer}>
          <TouchableOpacity
            style={[
              styles.platformButton,
              selectedPlatform === 'amazon' && styles.platformButtonSelected
            ]}
            onPress={() => setSelectedPlatform('amazon')}
          >
            <Text
              style={[
                styles.platformButtonText,
                selectedPlatform === 'amazon' && styles.platformButtonTextSelected
              ]}
            >
              Amazon
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.platformButton,
              selectedPlatform === 'flipkart' && styles.platformButtonSelected
            ]}
            onPress={() => setSelectedPlatform('flipkart')}
          >
            <Text
              style={[
                styles.platformButtonText,
                selectedPlatform === 'flipkart' && styles.platformButtonTextSelected
              ]}
            >
              Flipkart
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            style={[
              styles.searchButton,
              { backgroundColor: selectedPlatform === 'amazon' ? '#007bff' : '#2874f0' }
            ]} 
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Search for products on Amazon and Flipkart
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  platformContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  platformButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f8f8f8',
    minWidth: 120,
    alignItems: 'center',
  },
  platformButtonSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  platformButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  platformButtonTextSelected: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007bff',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default HomeScreen;
