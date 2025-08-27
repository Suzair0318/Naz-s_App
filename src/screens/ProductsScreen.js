import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { featuredProducts, newArrivals } from '../data/mockData';
import ProductCard from '../components/ProductCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 cards in a row with some margin

const ProductsScreen = ({ navigation, onScroll }) => {
  // Combine all products for this screen
  const allProducts = [...featuredProducts, ...newArrivals];

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>All Products</Text>
      <Text style={styles.headerSubtitle}>{allProducts.length} items available</Text>
    </View>
  );

  const renderProductCard = ({ item, index }) => (
    <View style={[
      styles.productCardContainer, 
      index % 2 === 0 ? styles.productCardLeft : styles.productCardRight
    ]}>
      <ProductCard
        product={item}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        onToggleWishlist={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={allProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={renderHeader}
      />
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
    paddingVertical: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.md,
    color: Colors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  productCardContainer: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  productCardLeft: {
    marginRight: 10,
  },
  productCardRight: {
    marginLeft: 10,
  },
});

export default ProductsScreen;
