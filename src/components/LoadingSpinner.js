import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const { width } = Dimensions.get('window');

const LoadingSpinner = ({ message = "Loading products..." }) => {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.3)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.3)).current;
  const scaleAnim3 = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Reset animation value
    spinAnim.setValue(0);
    
    // Main spinner rotation
    const spinAnimation = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    // Staggered dot animations
    const dotAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim1, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim1, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    const dotAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(scaleAnim2, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim2, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    const dotAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(scaleAnim3, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim3, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    // Text fade animation
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    dotAnimation1.start();
    dotAnimation2.start();
    dotAnimation3.start();
    fadeAnimation.start();

    return () => {
      spinAnimation.stop();
      dotAnimation1.stop();
      dotAnimation2.stop();
      dotAnimation3.stop();
      fadeAnimation.stop();
    };
  }, [spinAnim, scaleAnim1, scaleAnim2, scaleAnim3, fadeAnim]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.loadingContent}>
        {/* Main circular spinner */}
        <Animated.View 
          style={[
            styles.spinner,
            { transform: [{ rotate: spinInterpolate }] }
          ]}
        >
          <View style={styles.spinnerInner} />
        </Animated.View>

        {/* Animated dots */}
        <View style={styles.dotsContainer}>
          <Animated.View 
            style={[
              styles.dot,
              { transform: [{ scale: scaleAnim1 }] }
            ]}
          />
          <Animated.View 
            style={[
              styles.dot,
              { transform: [{ scale: scaleAnim2 }] }
            ]}
          />
          <Animated.View 
            style={[
              styles.dot,
              { transform: [{ scale: scaleAnim3 }] }
            ]}
          />
        </View>

        {/* Loading text */}
        <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
          {message}
        </Animated.Text>

        {/* Brand subtitle */}
        <Text style={styles.brandText}>Naz's Collection</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#E0E0E0',
    borderTopColor: Colors.primary,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    opacity: 0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginHorizontal: 6,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  brandText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});

export default LoadingSpinner;
