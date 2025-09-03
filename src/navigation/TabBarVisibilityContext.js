import React, { createContext, useContext, useMemo, useRef } from 'react';
import { Animated } from 'react-native';

const TabBarVisibilityContext = createContext(null);

export const TabBarVisibilityProvider = ({ children }) => {
  const translateY = useRef(new Animated.Value(0)).current; // 0 = visible, 80 = hidden

  const hideTabBar = () => {
    Animated.timing(translateY, {
      toValue: 100, // push down
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const showTabBar = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const value = useMemo(() => ({ translateY, hideTabBar, showTabBar }), [translateY]);

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  );
};

export const useTabBarVisibility = () => {
  const ctx = useContext(TabBarVisibilityContext);
  if (!ctx) throw new Error('useTabBarVisibility must be used within TabBarVisibilityProvider');
  return ctx;
};
