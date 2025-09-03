import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const ProductCard = ({ product, onPress, onToggleWishlist }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wishlistScaleAnim = useRef(new Animated.Value(1)).current;

  const handleWishlistToggle = () => {
    // Wishlist button animation
    Animated.sequence([
      Animated.timing(wishlistScaleAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(wishlistScaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(wishlistScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsWishlisted(!isWishlisted);
    if (onToggleWishlist) {
      onToggleWishlist();
    }
  };
  const calculateDiscount = () => {
    if (product.originalPrice && product.price) {
      const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      return discount;
    }
    return 0;
  };

  const renderPriceSection = () => {
    const discountPercent = calculateDiscount();
    
    return (
      <View style={styles.priceContainer}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price}</Text>
          {product.originalPrice && (
            <>
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderBadges = () => {
    const discountPercent = calculateDiscount();
    
    return (
      <View style={styles.badgeContainer}>
        {product.isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
        {product.isSale && discountPercent > 0 && (
          <View style={[styles.badge, styles.saleBadge]}>
            <Text style={styles.badgeText}>-{discountPercent}%</Text>
          </View>
        )}
      </View>
    );
  };

  const renderRating = () => (
    <View style={styles.ratingContainer}>
      <Text style={styles.rating}>★ {product.rating}</Text>
      <Text style={styles.reviews}>({product.reviews})</Text>
    </View>
  );

  const handleCardPress = () => {
    // Card press animation - bounce like wishlist
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      setTimeout(() => onPress(), 50);
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.container} 
        onPress={handleCardPress} 
        activeOpacity={0.95}
      >
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {renderBadges()}
        <View style={styles.buttonRow}>
          <Animated.View style={[{ transform: [{ scale: wishlistScaleAnim }] }]}>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.wishlistButton,
                isWishlisted && styles.wishlistButtonActive
              ]}
              onPress={handleWishlistToggle}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={isWishlisted ? "heart" : "heart-outline"} 
                size={16} 
                color={isWishlisted ? "#FFFFFF" : Colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {renderPriceSection()}
      </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  newBadge: {
    backgroundColor: Colors.success,
  },
  saleBadge: {
    backgroundColor: '#FF6B35',
  },
  discountBadge: {
    backgroundColor: '#FF4444',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  buttonRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 0,
    flexDirection: 'column',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cartButton: {
    backgroundColor: Colors.primary,
  },
  inCartButton: {
    backgroundColor: '#4CAF50',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  wishlistButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
  },
  wishlistButtonActive: {
    backgroundColor: '#FF4444',
    borderColor: '#FF4444',
    shadowColor: '#FF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    padding: 12,
  },
  category: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  reviews: {
    fontSize: 9,
    color: Colors.textLight,
  },
  priceContainer: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountInline: {
    fontSize: 11,
    color: '#FF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ProductCard;
