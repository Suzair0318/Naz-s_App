import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import useCartStore from '../store/cartStore';
import { Colors } from '../constants/Colors';
import LoadingSpinner from '../components/LoadingSpinner';

// API base (match other screens)
const API_BASE = 'http://192.168.18.11:3006';

// Normalize image URLs coming from backend
const normalizeImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://localhost:3006')) return url.replace('http://localhost:3006', API_BASE);
  if (url.startsWith('https://localhost:3006')) return url.replace('https://localhost:3006', API_BASE);
  if (url.startsWith('http://127.0.0.1:3006')) return url.replace('http://127.0.0.1:3006', API_BASE);
  if (url.startsWith('https://127.0.0.1:3006')) return url.replace('https://127.0.0.1:3006', API_BASE);
  if (url.startsWith('/')) return `${API_BASE}${url}`;
  return url;
};

const { width } = Dimensions.get('window');

// Reusable bounce touchable for consistent UX feedback
const BounceTouchable = ({
  onPress,
  disabled,
  children,
  style,
  activeOpacity = 0.9,
  scaleTo = 1.08,
  ...rest
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(scale, {
        toValue: scaleTo,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onPress && onPress();
    });
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ProductDetailScreen = ({ route, navigation }) => {
  const { product: initialProduct, productId } = route?.params || {};
  const [product, setProduct] = useState(initialProduct || null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageCarouselRef = useRef(null);
  const { addToCart } = useCartStore();

  // Fetch product details by ID if provided (or if we have a product with id but want fresh data)
  useEffect(() => {
    const id = productId || initialProduct?.id || initialProduct?._id;
    if (!id) return; // no id to fetch
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        setLoadingDetail(true);
        const resp = await fetch(`${API_BASE}/admin/products/${id}`);
        const data = await resp.json();
        // data can be the product object; map it to UI shape
        const p = data?.item || data; // support either {item: {...}} or direct
        if (p && isMounted) {
          const imagesArrRaw = Array.isArray(p.image) ? p.image : (p.image ? [p.image] : []);
          const images = imagesArrRaw.map((u) => normalizeImageUrl(u || ''));

          // sizes may come as ["XS,S,M,L,XL"] or a comma string
          let sizesArr = [];
          if (Array.isArray(p.sizes)) {
            sizesArr = p.sizes.length === 1 && typeof p.sizes[0] === 'string'
              ? p.sizes[0].split(',').map((s) => s.trim()).filter(Boolean)
              : p.sizes.map((s) => String(s).trim());
          } else if (typeof p.sizes === 'string') {
            sizesArr = p.sizes.split(',').map((s) => s.trim()).filter(Boolean);
          }

          // points may come as ["a,b,c"] or a comma string
          let pointsArr = [];
          if (Array.isArray(p.points)) {
            pointsArr = p.points.length === 1 && typeof p.points[0] === 'string'
              ? p.points[0].split(',').map((s) => s.trim()).filter(Boolean)
              : p.points.map((s) => String(s).trim());
          } else if (typeof p.points === 'string') {
            pointsArr = p.points.split(',').map((s) => s.trim()).filter(Boolean);
          }

          const mapped = {
            id: String(p._id ?? p.id ?? initialProduct?.id ?? ''),
            name: p.name,
            price: Number(p.price ?? 0),
            originalPrice: p.cutPrice != null ? Number(p.cutPrice) : null,
            image: images[0] || '',
            images,
            rating: Number(p.rating ?? initialProduct?.rating ?? 4.8),
            reviews: Number(p.reviews ?? initialProduct?.reviews ?? 0),
            isNew: !!p.isNew,
            isSale: !!p.isSale,
            category: p.category ?? '',
            colors: Array.isArray(p.colors) ? p.colors : (initialProduct?.colors || []),
            sizes: sizesArr,
            description: p.description ?? '',
            points: pointsArr,
            availableQuantity: Number(p.availableQuantity ?? initialProduct?.availableQuantity ?? Infinity),
            weight: Number(p.weight ?? initialProduct?.weight ?? 0),
          };
          setProduct(mapped);
        }
      } catch (e) {
        console.warn('Product detail fetch failed:', e?.message || e);
      } finally {
        isMounted = false;
        setLoadingDetail(false);
      }
    };
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Auto-select first available size and color when product loads
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0]);
      }
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0]);
      }
    }
  }, [product, selectedSize, selectedColor]);

  // Map color names to hex codes; if item already looks like hex, use directly
  const getColorHex = (c) => {
    if (!c) return '#CCCCCC';
    const color = String(c).trim();
    if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)) return color;
    const map = {
      Black: '#000000',
      White: '#FFFFFF',
      Navy: '#001F3F',
      Burgundy: '#800020',
      Cream: '#F5F5DC',
      Blush: '#F9D5D3',
      Camel: '#C19A6B',
      Gray: '#808080',
      Charcoal: '#36454F',
      'Floral Print': '#9C27B0',
      'Navy Floral': '#3F51B5',
    };
    return map[color] || '#CCCCCC';
  };

  // Use images array from fetched product; fallback to single
  const productImages = product
    ? (Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : [
            product.image,
            product.image && `${product.image}?v=1`,
            product.image && `${product.image}?v=2`,
          ].filter(Boolean))
    : [];

  if (loadingDetail && !product) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading product..." />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <BounceTouchable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </BounceTouchable>
      <BounceTouchable style={styles.wishlistButton}>
        <Text style={styles.wishlistIcon}>♡</Text>
      </BounceTouchable>
    </View>
  );

  const renderImageCarousel = () => {
    const renderImageItem = ({ item, index }) => (
      <View style={styles.imageSlide}>
        <Image source={{ uri: item }} style={styles.productImage} />
      </View>
    );

    return (
      <View style={styles.imageContainer}>
        <FlatList
          ref={imageCarouselRef}
          data={productImages}
          renderItem={renderImageItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          directionalLockEnabled={true}
          alwaysBounceHorizontal={false}
          bounces={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {productImages.map((_, index) => (
            <BounceTouchable
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex && styles.activeIndicator
              ]}
              onPress={() => {
                imageCarouselRef.current?.scrollToIndex({ index, animated: true });
                setCurrentImageIndex(index);
              }}
            />
          ))}
        </View>

        {/* Badges */}
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
  };

  const renderProductInfo = () => (
    <View style={styles.productInfo}>
      <Text style={[styles.category, { fontSize: 12 }]}>{product.category}</Text>
      <Text style={[styles.productName, { fontSize: 20 }]}>{product.name}</Text>
      
      {/* <View style={styles.ratingContainer}>
        <Text style={[styles.rating, { fontSize: 13 }]}>★ {product.rating}</Text>
        <Text style={[styles.reviews, { fontSize: 12 }]}>({product.reviews} reviews)</Text>
      </View> */}

      <View style={styles.priceContainer}>
        <Text style={[styles.price, { fontSize: 20 }]}>Rs {product.price}</Text>
        {product.originalPrice && (
          <Text style={[styles.originalPrice, { fontSize: 12 }]}>{product.originalPrice}</Text>
        )}
        {product.isSale && (
          <View style={styles.discountBadge}>
            <Text style={[styles.discountText, { fontSize: 11 }]}>
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderSizeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={[styles.selectorTitle, { fontSize: 14 }]}>Size</Text>
      <View style={styles.sizeContainer}>
        {product.sizes?.map((size) => (
          <BounceTouchable
            key={size}
            style={[
              styles.sizeOption,
              selectedSize === size && styles.selectedSizeOption
            ]}
            onPress={() => setSelectedSize(size)}
          >
            <Text style={[
              styles.sizeText,
              { fontSize: 12 },
              selectedSize === size && styles.selectedSizeText
            ]}>
              {size}
            </Text>
          </BounceTouchable>
        ))}
      </View>
    </View>
  );

  // const renderColorSelector = () => (
  //   <View style={styles.selectorContainer}>
  //     <Text style={[styles.selectorTitle, { fontSize: 14 }]}>Color</Text>
  //     <View style={styles.colorContainer}>
  //       {product.colors?.map((color) => (
  //         <BounceTouchable
  //           key={color}
  //           style={styles.swatchWrapper}
  //           onPress={() => setSelectedColor(color)}
  //           accessibilityLabel={`Select color ${color}`}
  //         >
  //           <View
  //             style={[
  //               styles.colorSwatch,
  //               { backgroundColor: getColorHex(color) },
  //               selectedColor === color && styles.selectedColorSwatch,
  //             ]}
  //           />
  //         </BounceTouchable>
  //       ))}
  //     </View>
  //   </View>
  // );

  const renderQuantitySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Quantity</Text>
      <View style={styles.quantityContainer}>
        <BounceTouchable
          style={styles.quantityButton}
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
        >
          <Text style={styles.quantityButtonText}>−</Text>
        </BounceTouchable>
        <Text style={styles.quantityText}>{quantity}</Text>
        <BounceTouchable
          style={styles.quantityButton}
          onPress={() => {
            const maxAvail = Number(product?.availableQuantity ?? Infinity);
            setQuantity((prev) => Math.max(1, Math.min(prev + 1, maxAvail)));
          }}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </BounceTouchable>
      </View>
    </View>
  );

  const renderDescription = () => {
    const desc = product?.description ||
      `Elevate your wardrobe with this stunning piece from Naz's Collection. Crafted with premium materials and attention to detail, this ${product.name?.toLowerCase?.() || 'item'} combines elegance with comfort.`;
    const pts = Array.isArray(product?.points) && product.points.length > 0
      ? product.points
      : [
          'Premium quality fabric',
          'Comfortable fit',
          'Easy care instructions',
          'Designed for the modern woman',
        ];

    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{desc}</Text>
        <View style={styles.pointsList}>
          {pts.map((p, i) => (
            <View key={`${p}-${i}`} style={styles.pointItem}>
              <Text style={styles.pointBullet}>{'\u2022'}</Text>
              <Text style={styles.pointText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionContainer}>
      <BounceTouchable
        style={styles.addToBagButton}
        onPress={() => {
          if (!product) return;
          const payload = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize,
            color: selectedColor,
            availableQuantity: Number(product.availableQuantity ?? Infinity),
            weight: Number(product.weight ?? 0),
          };
          addToCart(payload, quantity);
          navigation.navigate('MainTabs', { screen: 'Cart' });
        }}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F8F8F8']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.addToBagText}>Add to Cart</Text>
        </LinearGradient>
      </BounceTouchable>
      <BounceTouchable
        style={styles.buyNowButton}
        onPress={() => {
          if (!product) return;
          const buyItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: selectedSize,
            color: selectedColor,
            quantity: Math.max(1, Math.min(Number(quantity || 1), Number(product?.availableQuantity ?? Infinity))),
            availableQuantity: Number(product.availableQuantity ?? Infinity),
            weight: Number(product.weight ?? 0),
          };
          navigation.navigate('Checkout', { buyNowItem: buyItem });
        }}
      >
        <LinearGradient
          colors={['#000000', '#333333']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buyNowText}>Buy Now</Text>
        </LinearGradient>
      </BounceTouchable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* {renderHeader()} */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageCarousel()}
        {renderProductInfo()}
        {renderSizeSelector()}
        {/* {renderColorSelector()} */}
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
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#333333',
    fontWeight: 'bold',
  },
  wishlistButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIcon: {
    fontSize: 20,
    color: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 400,
    position: 'relative',
    backgroundColor: '#F8F8F8',
  },
  imageSlide: {
    width: width,
    height: 400,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF4757',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#2ED573',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  category: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: 28,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 34,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    color: '#FFA502',
    fontWeight: '600',
    marginRight: 8,
  },
  reviews: {
    fontSize: 14,
    color: '#888888',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 32,
    color: '#333333',
    fontWeight: 'bold',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 20,
    color: '#CCCCCC',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#FF4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  selectorTitle: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    marginBottom: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  selectedSizeOption: {
    borderColor: '#333333',
    backgroundColor: '#333333',
  },
  sizeText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  selectedSizeText: {
    color: '#FFFFFF',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    marginBottom: 8,
  },
  selectedColorOption: {
    borderColor: '#333333',
    backgroundColor: '#333333',
  },
  colorText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  selectedColorText: {
    color: '#FFFFFF',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  quantityButtonText: {
    fontSize: 20,
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  descriptionTitle: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  pointsList: {
    marginTop: 8,
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  pointBullet: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginRight: 8,
  },
  pointText: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  // Color swatches
  swatchWrapper: {
    marginRight: 10,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedColorSwatch: {
    borderWidth: 2,
    borderColor: '#333333',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addToBagButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#333333',
  },
  buyNowButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#333333',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToBagText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProductDetailScreen;
