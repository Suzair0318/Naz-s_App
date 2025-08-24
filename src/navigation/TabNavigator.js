import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';

// Simple tab navigator implementation
const TabNavigator = () => {
  const [activeTab, setActiveTab] = React.useState('Home');

  const tabs = [
    { name: 'Home', icon: '🏠', component: HomeScreen },
    { name: 'Categories', icon: '📂', component: CategoriesScreen },
    { name: 'Search', icon: '🔍', component: SearchScreen },
    { name: 'Cart', icon: '🛍️', component: CartScreen },
    { name: 'Profile', icon: '👤', component: ProfileScreen },
  ];

  const ActiveComponent = tabs.find(tab => tab.name === activeTab)?.component || HomeScreen;

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <View key={tab.name} style={styles.tabItem}>
          <Text 
            style={[
              styles.tabIcon,
              activeTab === tab.name && styles.activeTabIcon
            ]}
            onPress={() => setActiveTab(tab.name)}
          >
            {tab.icon}
          </Text>
          <Text 
            style={[
              styles.tabLabel,
              activeTab === tab.name && styles.activeTabLabel
            ]}
            onPress={() => setActiveTab(tab.name)}
          >
            {tab.name}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActiveComponent navigation={{ navigate: setActiveTab }} />
      </View>
      {renderTabBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 8,
    paddingBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    fontWeight: Fonts.weights.medium,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: Fonts.weights.semiBold,
  },
});

export default TabNavigator;
