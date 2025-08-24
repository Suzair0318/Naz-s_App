import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
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
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image source={Naz_Logo} style={styles.logoImage} resizeMode="contain" />
        <View style={styles.brandTextContainer}>
          <Text style={styles.brandName}>Naz's Collection</Text>
          <Text style={styles.brandTagline}> WOMEN'S FASHION</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.cartButton}>
        <Text style={styles.cartIcon}>🛍️</Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <TouchableOpacity style={styles.searchContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <Text style={styles.searchPlaceholder}>Search for elegant clothing...</Text>
    </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: Fonts.sizes.small,
    fontWeight: Fonts.weights.medium,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginTop: 2,
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
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: Colors.textWhite,
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    fontSize: Fonts.sizes.xxxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  bannerButton: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    fontWeight: Fonts.weights.semiBold,
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
