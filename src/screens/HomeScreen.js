import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { featuredProducts, categories, newArrivals, bannerData } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import CustomButton from '../components/CustomButton';
import Naz_Logo from '../assets/images/naz_logo.jpeg'

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, onScroll }) => {
  // Ensure we only pass serializable params through navigation
  const serializeProduct = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    image: p.image,
    rating: p.rating,
    reviews: p.reviews,
    isNew: !!p.isNew,
    isSale: !!p.isSale,
    category: p.category,
    colors: Array.isArray(p.colors) ? [...p.colors] : [],
    sizes: Array.isArray(p.sizes) ? [...p.sizes] : [],
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const cartBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Header entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCartPress = () => {
    // Cart bounce animation
    Animated.sequence([
      Animated.timing(cartBounceAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cartBounceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('Cart');
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerShadowContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <Image source={Naz_Logo} style={styles.logoImage} resizeMode="contain" />
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandName}>Naz's Collection</Text>
            <Text style={styles.brandTagline}>WOMEN'S FASHION</Text>
          </View>
        </Animated.View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleCartPress}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: cartBounceAnim }] }}>
            <Feather
              name="shopping-bag"
              size={24}
              color={Colors.textPrimary}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.cartBadge,
              { transform: [{ scale: cartBounceAnim }] }
            ]}
          >
            <Text style={styles.cartBadgeText}>3</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );



  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef(null);

  // Auto-scroll banner carousel
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % bannerData.length;
        if (bannerScrollRef.current) {
          bannerScrollRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        }
        return nextIndex;
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(bannerInterval);
  }, []);

  const renderBannerItem = ({ item }) => (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerImageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
          style={styles.bannerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </View>
      <View style={styles.bannerContent}>
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <View style={styles.bannerDivider} />
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        </View>
        <View style={styles.bannerButtonContainer}>
          <TouchableOpacity style={styles.premiumButton} activeOpacity={0.8}>
            <LinearGradient
              colors={['#C0C0C0', '#A8A8A8', '#909090']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.premiumButtonText}>{item.buttonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderBanner = () => (
    <View style={styles.bannerWrapper}>
      <FlatList
        ref={bannerScrollRef}
        data={bannerData}
        renderItem={renderBannerItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentBannerIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
      <View style={styles.bannerPagination}>
        {bannerData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === currentBannerIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderSectionHeader = (title, actionText, onActionPress) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <TouchableOpacity style={styles.viewAllButton} onPress={onActionPress}>
          <Text style={styles.viewAllText}>{actionText}</Text>
          <View style={styles.viewAllArrow} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <View style={styles.viewAllArrow} />
        </TouchableOpacity>
      </View>
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() => navigation.navigate('Products', {
                screen: 'Products',
                params: {
                  categoryName: item.name,
                  products: [...featuredProducts, ...newArrivals].filter(
                    p => p.category === item.name
                  )
                }
              })}
            />
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
    </View>
  );




  const renderFeaturedProducts = () => (
    <View style={styles.featuredSection}>
      {renderSectionHeader('Featured Products', 'View All')}
      <FlatList
        data={featuredProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.horizontalFeaturedCard}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: serializeProduct(item) })}
              onToggleWishlist={() => { }}
            />
          </View>
        )}
        contentContainerStyle={styles.featuredProductsList}
      />
    </View>
  );

  const renderNewArrivals = () => (
    <View style={styles.featuredSection}>
      {renderSectionHeader('New Arrivals', 'View All')}
      <FlatList
        data={newArrivals}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.horizontalFeaturedCard}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              onToggleWishlist={() => { }}
            />
          </View>
        )}
        contentContainerStyle={styles.featuredProductsList}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderBanner()}
        {renderCategories()}
        {renderNewArrivals()}
        {renderFeaturedProducts()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  headerShadowContainer: {
    // Shadow properties with curved shape
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 6,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 25,
  },
  brandTextContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.textLuxury,
    letterSpacing: 0.8,
    fontFamily: 'serif',
  },
  brandTagline: {
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    letterSpacing: 1.2,
    marginTop: 3,
    opacity: 0.8,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondary,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.bold,
  },
  brandTextContainer: {
    alignItems: 'flex-start',
  },
  brandName: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    lineHeight: 22,
  },
  brandSubtitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.medium,
    color: Colors.secondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  brandTagline: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  cartButton: {
    position: 'relative',
    padding: 14,
    // backgroundColor: Colors.surfaceElevated,
    // borderRadius: 20,
    // elevation: 4,
    // shadowColor: Colors.shadow,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 1,
    // shadowRadius: 6,
    // borderWidth: 1,
    // borderColor: Colors.borderLight,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.textPrimary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceElevated,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginHorizontal: 24,
    marginVertical: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: Fonts.sizes.medium,
    color: Colors.textSecondary,
    marginLeft: 12,
    fontStyle: 'italic',
    flex: 1,
    letterSpacing: 0.3,
  },
  bannerWrapper: {
    marginBottom: 32,
  },
  bannerContainer: {
    width: width,
    paddingHorizontal: 20,
    position: 'relative',
    marginTop: 20
  },
  bannerImageContainer: {
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 32,
  },
  bannerTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDivider: {
    width: 60,
    height: 2,
    backgroundColor: '#C0C0C0',
    marginVertical: 12,
    opacity: 0.8,
  },
  bannerButtonContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumButton: {
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  buttonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 38,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    letterSpacing: 0.8,
    fontWeight: '300',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  section: {
    marginVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  sectionAction: {
    fontSize: Fonts.sizes.medium,
    color: Colors.textLuxury,
    fontWeight: Fonts.weights.semiBold,
    letterSpacing: 0.2,
  },
  categoriesSection: {
    paddingVertical: 16,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitleContainer: {
    alignItems: 'flex-start',
  },
  premiumSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionTitleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#C0C0C0',
    marginTop: 8,
    borderRadius: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  viewAllArrow: {
    width: 6,
    height: 6,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: Colors.textSecondary,
    transform: [{ rotate: '45deg' }],
    marginLeft: 6,
  },
  categoriesContainer: {
    paddingLeft: 4,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  featuredSection: {
    marginTop: 16,
  },
  horizontalFeaturedCard: {
    width: 180,
    marginRight: 16,
  },
  featuredProductsList: {
    paddingHorizontal: 20,
  },
  productCardContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  productCardRight: {
    paddingLeft: 10,
  },
  horizontalProductCard: {
    width: width * 0.7,
    marginRight: 16,
  },
  horizontalProductsList: {
    paddingHorizontal: 20,
  },
  bannerPagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.textPrimary,
    width: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;
