import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import CustomButton from '../components/CustomButton';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route?.params || {};
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.wishlistButton}>
        <Text style={styles.wishlistIcon}>♡</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductImage = () => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: product.image }} style={styles.productImage} />
      {product.isSale && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleBadgeText}>SALE</Text>
        </View>
      )}
      {product.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
    </View>
  );

  const renderProductInfo = () => (
    <View style={styles.productInfo}>
      <Text style={styles.category}>{product.category}</Text>
      <Text style={styles.productName}>{product.name}</Text>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>★ {product.rating}</Text>
        <Text style={styles.reviews}>({product.reviews} reviews)</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>${product.price}</Text>
        {product.originalPrice && (
          <Text style={styles.originalPrice}>${product.originalPrice}</Text>
        )}
        {product.isSale && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderSizeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Size</Text>
      <View style={styles.sizeContainer}>
        {product.sizes?.map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.sizeOption,
              selectedSize === size && styles.selectedSizeOption
            ]}
            onPress={() => setSelectedSize(size)}
          >
            <Text style={[
              styles.sizeText,
              selectedSize === size && styles.selectedSizeText
            ]}>
              {size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderColorSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Color</Text>
      <View style={styles.colorContainer}>
        {product.colors?.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              selectedColor === color && styles.selectedColorOption
            ]}
            onPress={() => setSelectedColor(color)}
          >
            <Text style={[
              styles.colorText,
              selectedColor === color && styles.selectedColorText
            ]}>
              {color}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuantitySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Quantity</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => setQuantity(quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.descriptionContainer}>
      <Text style={styles.descriptionTitle}>Description</Text>
      <Text style={styles.descriptionText}>
        Elevate your wardrobe with this stunning piece from Naz's Collection. 
        Crafted with premium materials and attention to detail, this {product.name.toLowerCase()} 
        combines elegance with comfort. Perfect for both casual and formal occasions.
        {'\n\n'}
        • Premium quality fabric
        • Comfortable fit
        • Easy care instructions
        • Designed for the modern woman
      </Text>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <CustomButton
        title="Add to Bag"
        variant="outline"
        size="large"
        style={styles.addToBagButton}
        onPress={() => {}}
      />
      <CustomButton
        title="Buy Now"
        variant="primary"
        size="large"
        style={styles.buyNowButton}
        onPress={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProductImage()}
        {renderProductInfo()}
        {renderSizeSelector()}
        {renderColorSelector()}
        {renderQuantitySelector()}
        {renderDescription()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      {renderActionButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: Colors.textPrimary,
  },
  wishlistButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: {
    fontSize: 18,
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 400,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saleBadgeText: {
    color: Colors.textWhite,
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  newBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  newBadgeText: {
    color: Colors.textWhite,
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  productInfo: {
    padding: 20,
  },
  category: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: Fonts.sizes.xxl,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.bold,
    lineHeight: Fonts.lineHeights.tight * Fonts.sizes.xxl,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    fontWeight: Fonts.weights.semiBold,
    marginRight: 8,
  },
  reviews: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: Fonts.sizes.xxxl,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.bold,
    marginRight: 12,
  },
  originalPrice: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: Colors.textWhite,
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  selectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
    marginBottom: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    marginBottom: 8,
  },
  selectedSizeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  sizeText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium,
  },
  selectedSizeText: {
    color: Colors.textWhite,
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    marginBottom: 8,
  },
  selectedColorOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  colorText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.medium,
  },
  selectedColorText: {
    color: Colors.textWhite,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityButtonText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
  },
  quantityText: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: Fonts.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Fonts.weights.semiBold,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Fonts.lineHeights.relaxed * Fonts.sizes.md,
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addToBagButton: {
    flex: 1,
    marginRight: 8,
  },
  buyNowButton: {
    flex: 1,
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProductDetailScreen;
