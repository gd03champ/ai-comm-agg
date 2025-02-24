import React from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { ProductCard } from './ProductCard';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Product {
  title: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  platform: string;
}

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  error?: string;
  onProductPress?: (product: Product) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function ProductList({
  products,
  isLoading,
  error,
  onProductPress,
  onRefresh,
  isRefreshing = false,
}: ProductListProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ThemedText>No products found</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View style={styles.productContainer}>
          <ProductCard
            {...item}
            onPress={() => onProductPress?.(item)}
          />
        </View>
      )}
      keyExtractor={(item, index) => `${item.platform}-${index}`}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={tintColor}
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    textAlign: 'center',
    color: '#ff6b6b',
  },
  list: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    marginBottom: 16,
  },
});
