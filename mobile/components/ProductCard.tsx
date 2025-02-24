import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from './ThemedText';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ProductCardProps {
  title: string;
  price: number;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  platform: string;
  onPress?: () => void;
}

export function ProductCard({
  title,
  price,
  imageUrl,
  rating,
  reviews,
  platform,
  onPress,
}: ProductCardProps) {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].background }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: Colors[colorScheme ?? 'light'].tabIconDefault }]} />
        )}
        <View style={[styles.platformBadge, { backgroundColor: tintColor }]}>
          <ThemedText style={styles.platformText}>
            {platform === 'amazon' ? 'Amazon' : 'Flipkart'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <ThemedText numberOfLines={2} style={styles.title}>
          {title}
        </ThemedText>

        <View style={styles.priceContainer}>
          <ThemedText type="defaultSemiBold" style={styles.price}>
            ₹{price.toLocaleString('en-IN')}
          </ThemedText>
          
          {rating && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={12} color="#FFD700" />
              <ThemedText style={styles.rating}>{rating.toFixed(1)}</ThemedText>
              {reviews && (
                <ThemedText style={styles.reviews}>
                  ({reviews.toLocaleString('en-IN')})
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 columns with 16px padding on sides and between

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: cardWidth,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  platformBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  platformText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    marginBottom: 8,
    height: 40, // Approximately 2 lines
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    marginLeft: 2,
    opacity: 0.7,
  },
});
