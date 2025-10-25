import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { featuredProducts, newArrivals } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import Feather from 'react-native-vector-icons/Feather';

const SearchScreen = ({ navigation, route, onScroll }) => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [recentSearches] = useState(['Dresses', 'Blouses', 'Elegant', 'Evening wear']);

  // Categories passed from Products screen (fallback to unique categories from mock data)
  const passedCategories = route?.params?.categories;
  const categories = useMemo(() => {
    if (Array.isArray(passedCategories) && passedCategories.length > 0) return passedCategories;
    // fallback from mock data
    const all = [...featuredProducts, ...newArrivals];
    return ['All', ...new Set(all.map(p => p.category).filter(Boolean))];
  }, [passedCategories]);

  const allProducts = [...featuredProducts, ...newArrivals];

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={Colors.textPrimary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for elegant clothing..."
          placeholderTextColor={Colors.textPrimary}
          value={searchQuery}
          onChangeText={handleSearch}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Feather name="x" size={18} color={Colors.textPrimary} style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRecentSearches = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recent Searches</Text>
      <View style={styles.tagsContainer}>
        {recentSearches.map((search, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tag}
            onPress={() => handleSearch(search)}
          >
            <Text style={styles.tagText}>{search}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCategorySuggestions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.tagsContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={styles.tag}
            onPress={() => {
              navigation.navigate('MainTabs', {
                screen: 'Products',
                params: { categoryName: cat },
              });
            }}
          >
            <Text style={styles.tagText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSearchResults = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {filteredProducts.length} Results for "{searchQuery}"
      </Text>
      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={[styles.productCardContainer, index % 2 === 1 && styles.productCardRight]}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: serializeProduct(item) })}
              onToggleWishlist={() => {}}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🔍</Text>
      <Text style={styles.emptyStateTitle}>Search for Products</Text>
      <Text style={styles.emptyStateText}>
        Find your perfect piece from our elegant collection
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {searchQuery.trim() ? (
        filteredProducts.length > 0 ? renderSearchResults() : renderEmptyState()
      ) : (
        <>
          {renderCategorySuggestions()}
          {renderRecentSearches()}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 46,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: Fonts.sizes.md,
    color: Colors.textPrimary,
    paddingVertical: 10,
  },
  clearIcon: {
    color: Colors.textLight,
    padding: 6,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Fonts.weights.medium,
  },
  productCardContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  productCardRight: {
    paddingLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyStateTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: Fonts.weights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Fonts.lineHeights.relaxed * Fonts.sizes.md,
  },
});

export default SearchScreen;
