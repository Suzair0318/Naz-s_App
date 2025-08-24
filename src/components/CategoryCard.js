import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const CategoryCard = ({ category, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: category.image }} style={styles.image} />
      <View style={styles.overlay} />
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{category.name}</Text>
        <Text style={styles.itemCount}>{category.itemCount} items</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  name: {
    fontSize: Fonts.sizes.md,
    color: Colors.textWhite,
    fontWeight: Fonts.weights.semiBold,
    marginBottom: 2,
  },
  itemCount: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textWhite,
    opacity: 0.9,
  },
});

export default CategoryCard;
