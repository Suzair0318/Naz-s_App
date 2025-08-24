import React from 'react';
import { StatusBar } from 'react-native';
import TabNavigator from './src/navigation/TabNavigator';
import { Colors } from './src/constants/Colors';

function App() {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.background}
      />
      <TabNavigator />
    </>
  );
}

export default App;