import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Animated, Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { TabBarVisibilityProvider, useTabBarVisibility } from './TabBarVisibilityContext';

const Tab = createBottomTabNavigator();

// Animated wrapper for the default BottomTabBar that slides up/down
const AnimatedTabBar = (props) => {
  const { translateY } = useTabBarVisibility();
  return (
    <Animated.View
      pointerEvents="box-none"
      style={{
        transform: [
          {
            translateY: translateY.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 100],
              extrapolate: 'clamp',
            }),
          },
        ],
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

// Premium animated tab icon component
const PremiumTabIcon = ({ focused, iconName, color, size, cartCount, routeName }) => {
  const [scaleValue] = useState(new Animated.Value(focused ? 1.2 : 1));
  const [bounceValue] = useState(new Animated.Value(focused ? 1 : 0));

  useEffect(() => {
    // Scale animation for focus
    Animated.spring(scaleValue, {
      toValue: focused ? 1.2 : 1,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    }).start();

    // Bounce animation for active state
    Animated.spring(bounceValue, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();
  }, [focused]);

  return (
    <View style={styles.premiumTabContainer}>
      {/* Clean active background */}
      {focused && (
        <Animated.View 
          style={[
            styles.activeBackground,
            {
              transform: [{ scale: bounceValue }],
              opacity: bounceValue,
            }
          ]}
        >
          <LinearGradient
            colors={[`${Colors.primary}12`, `${Colors.primary}18`, `${Colors.primary}12`]}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      )}
      
      {/* Icon container with scale animation */}
      <Animated.View 
        style={[
          styles.iconWrapper,
          focused && styles.iconWrapperActive,
          {
            transform: [{ scale: scaleValue }],
          }
        ]}
      >
        <Ionicons 
          name={iconName} 
          size={focused ? size + 2 : size} 
          color={focused ? Colors.primary : color}
          style={[
            styles.tabIcon,
            focused && styles.tabIconActive
          ]}
        />
        
        {/* Premium cart badge */}
        {routeName === 'Cart' && cartCount > 0 && (
          <Animated.View 
            style={[
              styles.premiumBadge,
              {
                transform: [{ scale: scaleValue }],
              }
            ]}
          >
            <LinearGradient
              colors={['#FF6B35', '#FF8E53', '#FF6B35']}
              style={styles.badgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.premiumBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}
      </Animated.View>
      
      {/* Active indicator dot */}
      {focused && (
        <Animated.View 
          style={[
            styles.activeDot,
            {
              opacity: bounceValue,
              transform: [{ scale: bounceValue }],
            }
          ]}
        />
      )}
    </View>
  );
};

const TabNavigator = () => {
  // Derive cart count directly from store so it updates instantly
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + (item.quantity || 0), 0)
  );
  const itemsLength = useCartStore((state) => state.items.length);
  const isAuthenticated = useAuthStore((s) => !!s.user);

  // Hydrate cart on app/tab mount so badge is correct immediately
  useEffect(() => {
    const hydrate = async () => {
      if (itemsLength > 0) return;
      if (isAuthenticated) {
        await useCartStore.getState().loadCartFromServer();
      } else {
        await useCartStore.getState().loadCartFromStorage();
      }
    };
    hydrate();
  }, [isAuthenticated, itemsLength]);

  return (
    <TabBarVisibilityProvider>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return (
            <PremiumTabIcon
              focused={focused}
              iconName={iconName}
              color={color}
              size={size}
              cartCount={cartCount}
              routeName={route.name}
            />
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.premiumTabBar,
        tabBarLabelStyle: styles.premiumTabLabel,
        tabBarItemStyle: styles.premiumTabItem,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      })}
      tabBar={(props) => <AnimatedTabBar {...props} />}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{ tabBarLabel: 'Shop' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
    </TabBarVisibilityProvider>
  );
};

const styles = StyleSheet.create({
  // Premium Tab Container
  premiumTabContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  
  // Active Background Glow
  activeBackground: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    top: -5,
    left: 2.5,
  },
  
  gradientBackground: {
    flex: 1,
    borderRadius: 22.5,
  },
  
  // Icon Wrapper
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  
  iconWrapperActive: {
    backgroundColor: `${Colors.primary}08`,
    // Removed shadows for cleaner look
  },
  
  // Tab Icon
  tabIcon: {
    // Clean design without shadows
  },
  
  tabIconActive: {
    // Clean active state without shadows
  },
  
  // Premium Badge
  premiumBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  
  badgeGradient: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    // Removed text shadow for cleaner look
  },
  
  // Active Indicator Dot
  activeDot: {
    position: 'absolute',
    bottom: -12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    // Removed shadows for cleaner minimal look
  },
  
  // Premium Tab Bar
  premiumTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 20,
    left: 20,
    right: 20,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    borderWidth: 0,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    paddingHorizontal: 8,
    paddingVertical: 8,
    height: 80,
    // Glass morphism effect
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.8)',
    // Backdrop blur simulation
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  
  // Premium Tab Label
  premiumTabLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.semiBold,
    marginTop: 2,
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  
  // Premium Tab Item
  premiumTabItem: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  
  // Legacy styles (keeping for compatibility)
  tabIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 25,
    left: 25,
    right: 25,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    height: 70,
  },
  tabBarLabel: {
    fontSize: Fonts.sizes.xs,
    fontWeight: Fonts.weights.medium,
    marginTop: 4,
  },
  tabBarItem: {
    paddingVertical: 8,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TabNavigator;
