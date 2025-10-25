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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../constants/Colors';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTabBarVisibility } from '../navigation/TabBarVisibilityContext';
import { ENDPOINTS } from '../utils/endpoint';
import { normalizeImageUrl } from '../utils/image';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 50) / 2; // Better spacing for 2 cards

// Small animated spinner component for footer
const FooterSpinner = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinAnimation.start();
    return () => spinAnimation.stop();
  }, [spinAnim]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      style={[
        styles.footerSpinner,
        { transform: [{ rotate: spinInterpolate }] }
      ]}
    />
  );
};

const ProductsScreen = ({ navigation, route, onScroll }) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  // Decouple input text from the applied search term
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  // Keep input focus stable; no need to track focus state
  const inputRef = useRef(null);
  const navigatingToSearchRef = useRef(false);
  const { hideTabBar, showTabBar } = useTabBarVisibility();
  const lastYRef = useRef(0);
  const lastDirRef = useRef('up');
  const ACCEL_THRESHOLD = 8; // px change before toggling
  const MIN_Y_TO_HIDE = 50; // don't hide near top

  // API state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Overlay loader for category/search refetches
  const [overlayLoading, setOverlayLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  // Keep selected category chip in view (horizontal scroll)
  const filtersScrollRef = useRef(null);
  const filtersScrollXRef = useRef(0);
  const [filtersViewportWidth, setFiltersViewportWidth] = useState(0);
  const chipLayoutsRef = useRef({});

  // Pre-select category when navigated with params
  useEffect(() => {
    const categoryFromParams = route?.params?.categoryName;
    if (categoryFromParams) {
      setSelectedFilter(categoryFromParams);
      setAppliedSearch('');
    }
  }, [route?.params?.categoryName]);

  // Fetch products from API (supports category + pagination via lastId)
  const fetchProducts = async ({ reset } = { reset: false }) => {
    if (loading) return;
    try {
      if (reset) {
        // Show full overlay loader on category/search changes
        setOverlayLoading(true);
        setRefreshing(false);
      } else {
        // Use footer loader for infinite scroll
        setLoading(true);
      }
      const params = new URLSearchParams();
      params.set('limit', '20');
      if (selectedFilter && selectedFilter !== 'All') params.set('category', selectedFilter);
      if (appliedSearch && appliedSearch.trim().length > 0) params.set('q', appliedSearch.trim());
      if (!reset && nextCursor) params.set('lastId', nextCursor);
      const url = `${ENDPOINTS.live}/admin/products?${params.toString()}`;
      const resp = await fetch(url);
      const json = await resp.json();
      const items = Array.isArray(json?.items) ? json.items : [];
      // Map items to ProductCard shape
      const mapped = items.map((p) => {
        const imagesArrRaw = Array.isArray(p.image) ? p.image : (p.image ? [p.image] : []);
        const imagesArr = imagesArrRaw.map((u) => normalizeImageUrl(u || ''));
        const firstImage = imagesArr.length > 0 ? imagesArr[0] : '';

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

        return {
          id: String(p._id ?? p.id ?? p.name),
          name: p.name,
          price: Number(p.price ?? 0),
          originalPrice: p.cutPrice != null ? Number(p.cutPrice) : null,
          image: firstImage,
          images: imagesArr,
          rating: Number(p.rating ?? 4.8),
          reviews: Number(p.reviews ?? 0),
          isNew: !!p.isNew,
          isSale: !!p.isSale,
          category: p.category ?? '',
          colors: Array.isArray(p.colors) ? p.colors : [],
          sizes: sizesArr,
          description: p.description ?? '',
          points: pointsArr,
          availableQuantity: Number(p.availableQuantity ?? 0),
        };
      });

      setProducts((prev) => (reset ? mapped : [...prev, ...mapped]));
      setNextCursor(json?.nextCursor ?? null);
      setHasMore(!!json?.hasMore);
    } catch (e) {
      console.warn('Products fetch failed:', e?.message || e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setOverlayLoading(false);
    }
  };

  // Initial and category-change fetch
  useEffect(() => {
    // reset list when category changes
    setNextCursor(null);
    fetchProducts({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  // Re-fetch when search is applied
  useEffect(() => {
    setNextCursor(null);
    fetchProducts({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch]);
  
  const serializeProduct = (p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    image: p.image,
    images: Array.isArray(p.images) ? [...p.images] : (p.image ? [p.image] : []),
    rating: p.rating,
    reviews: p.reviews,
    isNew: !!p.isNew,
    isSale: !!p.isSale,
    category: p.category,
    colors: Array.isArray(p.colors) ? [...p.colors] : [],
    sizes: Array.isArray(p.sizes) ? [...p.sizes] : [],
    availableQuantity: typeof p.availableQuantity === 'number' ? p.availableQuantity : Number(p.availableQuantity ?? 0),
  });

  // Get unique categories from loaded products
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  // If server-side search is active (appliedSearch not empty), products are already filtered by API.
  // Otherwise, we can keep client-side filtering by category search text if needed.
  const filteredProducts = appliedSearch
    ? products
    : products.filter(product => {
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
            if (!navigatingToSearchRef.current) {
              requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
            }
          }}
          onFocus={() => {
            navigatingToSearchRef.current = true;
            navigation.navigate('SearchMain', { categories });
            setTimeout(() => { navigatingToSearchRef.current = false; }, 600);
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
            navigatingToSearchRef.current = true;
            navigation.navigate('SearchMain', { categories });
            setTimeout(() => { navigatingToSearchRef.current = false; }, 600);
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
        ref={filtersScrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
        onLayout={(e) => {
          setFiltersViewportWidth(e.nativeEvent.layout.width);
        }}
        onScroll={(e) => {
          filtersScrollXRef.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedFilter === category && styles.filterChipActive
            ]}
            onLayout={(e) => {
              // Record each chip's x/width relative to the ScrollView content
              chipLayoutsRef.current[category] = e.nativeEvent.layout;
            }}
            onPress={() => {
              setSelectedFilter(category);
              // Bring the slider back to the start so "All" and the selection are visible
              requestAnimationFrame(() => {
                const scrollView = filtersScrollRef.current;
                if (scrollView) {
                  scrollView.scrollTo({ x: 0, y: 0, animated: true });
                }
              });
            }}
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
      {appliedSearch ? (
        <>
          <Text style={styles.emptyStateText}>No results for “{appliedSearch}”.</Text>
          <TouchableOpacity
            style={styles.emptyPrimaryButton}
            activeOpacity={0.85}
            onPress={() => {
              // Clear search and category, then reload first page
              setSearchInput('');
              setAppliedSearch('');
              setSelectedFilter('All');
              setProducts([]);
              setNextCursor(null);
              fetchProducts({ reset: true });
            }}
          >
            <Text style={styles.emptyPrimaryButtonText}>Back</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.emptyStateText}>
          Try selecting a different category or check back later for new arrivals.
        </Text>
      )}
    </View>
  );

  // Show loading spinner on initial load
  if (loading && products.length === 0) {
    return <LoadingSpinner message="Discovering fashion..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderSearchBar()}
      <View style={styles.listWrapper}>
        {overlayLoading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <LoadingSpinner message="Refreshing styles..." />
          </View>
        )}
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          refreshing={refreshing}
          onRefresh={() => fetchProducts({ reset: true })}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMore && !loading) {
              fetchProducts({ reset: false });
            }
          }}
          ListFooterComponent={
            loading || hasMore ? (
              <View style={styles.footerContainer}>
                {loading && (
                  <View style={styles.footerLoadingContainer}>
                    <View style={styles.footerSpinner} />
                    <Text style={styles.footerLoadingText}>Loading more styles...</Text>
                  </View>
                )}
                {!loading && hasMore && (
                  <Text style={styles.footerText}>Loading more…</Text>
                )}
                {!hasMore && products.length > 0 && (
                  <Text style={styles.footerTextMuted}>You have reached the end</Text>
                )}
              </View>
            ) : (
              products.length > 0 && (
                <View style={styles.footerContainer}>
                  <Text style={styles.footerTextMuted}>You have reached the end</Text>
                </View>
              )
            )
          }
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.75)',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  emptyPrimaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyPrimaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footerTextMuted: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '400',
  },
  footerLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderTopColor: Colors.primary,
    marginRight: 8,
  },
  footerLoadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default ProductsScreen;
