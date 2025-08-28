import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const ProductCard = ({ product, onPress, onToggleWishlist }) => {
  const renderPriceSection = () => (
    <View style={styles.priceContainer}>
      <Text style={styles.price}>${product.price}</Text>
      {product.originalPrice && (
        <Text style={styles.originalPrice}>${product.originalPrice}</Text>
      )}
    </View>
  );

  const renderBadges = () => (
    <View style={styles.badgeContainer}>
      {product.isNew && (
        <View style={[styles.badge, styles.newBadge]}>
          <Text style={styles.badgeText}>NEW</Text>
        </View>
      )}
      {product.isSale && (
        <View style={[styles.badge, styles.saleBadge]}>
          <Text style={styles.badgeText}>SALE</Text>
        </View>
      )}
    </View>
  );

  const renderRating = () => (
    <View style={styles.ratingContainer}>
      <Text style={styles.rating}>★ {product.rating}</Text>
      <Text style={styles.reviews}>({product.reviews})</Text>
    </View>
  );

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} />
        {renderBadges()}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.wishlistButton]}
            onPress={onToggleWishlist}
          >
            <Text style={styles.wishlistIcon}>♡</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {renderPriceSection()}
      </View>
    </TouchableOpacity>
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
    top: 8,
    left: 8,
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
    backgroundColor: Colors.accent,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  buttonRow: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'column',
    gap: 8,
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
  },
  wishlistIcon: {
    fontSize: 16,
    color: Colors.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
});

export default ProductCard;
