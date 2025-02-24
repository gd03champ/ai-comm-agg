import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SearchBar } from '@/components/SearchBar';
import { ProductList } from '@/components/ProductList';
import { ProductWebView } from '@/components/ProductWebView';
import { ThemedView } from '@/components/ThemedView';

interface Product {
  title: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  platform: string;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);

  const handleSearch = async (query: string, platform: string) => {
    setIsLoading(true);
    setError(undefined);
    setProducts([]);

    try {
      // Get search URL from backend
      const response = await fetch('http://localhost:8000/api/v1/products/search-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          platform,
          page: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get search URL');
      }

      const data = await response.json();
      if (data.links && data.links.length > 0) {
        setWebViewUrl(data.links[0].search_url);
      } else {
        throw new Error('No search URL found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsLoading(false);
    }
  };

  const handleProductData = (data: Product[]) => {
    setProducts(data);
    setIsLoading(false);
    setWebViewUrl(null); // Hide WebView after data is extracted
  };

  const handleWebViewError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
    setWebViewUrl(null);
  };

  const handleProductPress = (product: Product) => {
    // TODO: Navigate to product detail screen
    console.log('Product pressed:', product);
  };

  return (
    <ThemedView style={styles.container}>
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />
      
      {webViewUrl ? (
        <View style={styles.webviewContainer}>
          <ProductWebView
            url={webViewUrl}
            onProductData={handleProductData}
            onError={handleWebViewError}
          />
        </View>
      ) : (
        <ProductList
          products={products}
          isLoading={isLoading}
          error={error}
          onProductPress={handleProductPress}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
    opacity: 0, // Hide WebView but keep it functional
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
