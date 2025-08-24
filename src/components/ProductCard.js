import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const ProductCard = ({ product, onPress, onAddToCart, onToggleWishlist }) => {
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
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={onToggleWishlist}
        >
          <Text style={styles.wishlistIcon}>♡</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        {renderRating()}
        {renderPriceSection()}
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={onAddToCart}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
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
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishlistIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  contentContainer: {
    padding: 12,
  },
  category: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: Fonts.sizes.medium,
    color: Colors.text,
    fontWeight: Fonts.weights.semiBold,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: Fonts.sizes.small,
    color: Colors.primary,
    fontWeight: Fonts.weights.medium,
    marginRight: 4,
  },
  reviews: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: Fonts.sizes.large,
    color: Colors.text,
    fontWeight: Fonts.weights.bold,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: Fonts.sizes.small,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.semiBold,
  },
});

export default ProductCard;
