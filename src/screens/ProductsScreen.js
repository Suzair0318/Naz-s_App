import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { featuredProducts, newArrivals } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { useTabBarVisibility } from '../navigation/TabBarVisibilityContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2; // Better spacing for 2 cards

const ProductsScreen = ({ navigation, route, onScroll }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  // Decouple input text from the applied search term
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  // Keep input focus stable; no need to track focus state
  const inputRef = useRef(null);
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const lastYRef = useRef(0);
  const lastDirRef = useRef('up');
  const ACCEL_THRESHOLD = 8; // px change before toggling
  const MIN_Y_TO_HIDE = 50; // don't hide near top

  // Pre-select category when navigated with params
  useEffect(() => {
    const categoryFromParams = route?.params?.categoryName;
    if (categoryFromParams) {
      setSelectedFilter(categoryFromParams);
      setAppliedSearch('');
    }
  }, [route?.params?.categoryName]);
  
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

  // Combine all products
  const allProducts = [...featuredProducts, ...newArrivals];
  
  // Get unique categories for filters
  const categories = ['All', ...new Set(allProducts.map(p => p.category))];
  
  // Filter products based on selected category and the APPLIED search term (only when search is pressed)
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedFilter === 'All' || product.category === selectedFilter;
    const matchesSearch = appliedSearch === '' || 
      product.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
      product.category.toLowerCase().includes(appliedSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.textSecondary}
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
          blurOnSubmit={false}
          onBlur={() => {
            // If focus is lost unexpectedly, re-focus to keep keyboard open
            requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
          }}
          onSubmitEditing={() => {
            setAppliedSearch(searchInput);
            // keep focus so keyboard stays open unless user dismisses
            requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
          }}
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchInput('');
              setAppliedSearch('');
              requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
            }}
          >
            <Feather name="x" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {
            setAppliedSearch(searchInput);
            requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
          }}
          activeOpacity={0.8}
        >
          <View style={styles.searchButtonContainer}>
            <Feather name="search" size={14} color={Colors.textLight} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <Text style={styles.filtersTitle}>Categories</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedFilter === category && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(category)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === category && styles.filterTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderResultsHeader = () => (
    <View style={styles.resultsHeader}>
      <Text style={styles.resultsText}>
        {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} 
        {selectedFilter !== 'All' && ` in ${selectedFilter}`}
      </Text>
    </View>
  );

  const renderProductCard = ({ item, index }) => (
    <View style={[
      styles.productCardContainer,
      index % 2 === 0 ? styles.productCardLeft : styles.productCardRight
    ]}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: serializeProduct(item) })}
        onToggleWishlist={() => {}}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>👗</Text>
      <Text style={styles.emptyStateTitle}>No items found</Text>
      <Text style={styles.emptyStateText}>
        Try selecting a different category or check back later for new arrivals.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderSearchBar()}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        onScroll={(e) => {
          const y = e.nativeEvent.contentOffset.y;
          const dy = y - lastYRef.current;
          // Only react if movement is significant
          if (Math.abs(dy) > ACCEL_THRESHOLD) {
            if (dy > 0 && y > MIN_Y_TO_HIDE && lastDirRef.current !== 'down') {
              hideTabBar();
              lastDirRef.current = 'down';
            } else if (dy < 0 && lastDirRef.current !== 'up') {
              showTabBar();
              lastDirRef.current = 'up';
            }
            lastYRef.current = y;
          } else {
            // small movement: just update lastY without toggling
            lastYRef.current = y;
          }
          // Preserve external onScroll if provided
          if (typeof onScroll === 'function') {
            onScroll(e);
          }
        }}
        scrollEventThrottle={16}
        ListHeaderComponent={(
          <>
            {renderFilters()}
            {renderResultsHeader()}
          </>
        )}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingLeft : 5,
    backgroundColor: Colors.background,
    marginHorizontal : 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    width: '100%',
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  clearButton: {
    padding: 6,
    marginLeft: 8,
  },
  searchButton: {
    borderRadius: 16,
    elevation: 1,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchButtonContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Colors.accent,
  },
  filtersContainer: {
    marginBottom: 20
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  filtersScroll: {
    paddingRight: 20,
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  productCardContainer: {
    width: CARD_WIDTH,
    marginBottom: 24,
  },
  productCardLeft: {
    marginRight: 5,
  },
  productCardRight: {
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ProductsScreen;
