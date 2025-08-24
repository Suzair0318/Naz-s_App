import React, { useRef, useEffect } from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { featuredProducts, categories, newArrivals, bannerData } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import CustomButton from '../components/CustomButton';
import  Naz_Logo from '../assets/images/naz_logo.jpeg'

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
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

  const renderSearchBar = () => (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.searchTouchable}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.8}
      >
        <Feather name="search" size={18} color={Colors.textSecondary} />
        <Text style={styles.searchPlaceholder}>Search for elegant clothing...</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=300&fit=crop' }}
        style={styles.bannerImage}
      />
      <View style={styles.bannerOverlay} />
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>New Collection</Text>
        <Text style={styles.bannerSubtitle}>Discover elegance in every piece</Text>
        <CustomButton
          title="Shop Now"
          variant="primary"
          size="medium"
          style={styles.bannerButton}
        />
      </View>
    </View>
  );

  const renderSectionHeader = (title, actionText, onActionPress) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      {renderSectionHeader('Shop by Category', 'View All')}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => navigation.navigate('Category', { category: item })}
          />
        )}
        contentContainerStyle={styles.categoriesList}
      />
    </View>
  );

  const renderFeaturedProducts = () => (
    <View style={styles.section}>
      {renderSectionHeader('Featured Products', 'View All')}
      <FlatList
        data={featuredProducts.slice(0, 2)}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.productCardContainer, index % 2 === 1 && styles.productCardRight]}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              onAddToCart={() => {}}
              onToggleWishlist={() => {}}
            />
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );

  const renderNewArrivals = () => (
    <View style={styles.section}>
      {renderSectionHeader('New Arrivals', 'View All')}
      <FlatList
        data={newArrivals}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.horizontalProductCard}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
              onAddToCart={() => {}}
              onToggleWishlist={() => {}}
            />
          </View>
        )}
        contentContainerStyle={styles.horizontalProductsList}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderSearchBar()}
        {renderBanner()}
        {renderCategories()}
        {renderFeaturedProducts()}
        {renderNewArrivals()}
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
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    elevation: 3,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  searchTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: Fonts.sizes.medium,
    color: Colors.textLight,
    marginLeft: 12,
    fontStyle: 'italic',
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.45)',
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bannerTitle: {
    fontSize: Fonts.sizes.extraLarge,
    fontWeight: Fonts.weights.bold,
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bannerSubtitle: {
    fontSize: Fonts.sizes.medium,
    color: '#FFFFFF',
    marginBottom: 20,
    opacity: 0.95,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  bannerButton: {
    paddingHorizontal: 24,
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
    fontSize: Fonts.sizes.large,
    fontWeight: Fonts.weights.bold,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  sectionAction: {
    fontSize: Fonts.sizes.medium,
    color: Colors.textLuxury,
    fontWeight: Fonts.weights.semiBold,
    letterSpacing: 0.2,
  },
  categoriesList: {
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
  bottomSpacing: {
    height: 20,
  },
});

export default HomeScreen;
