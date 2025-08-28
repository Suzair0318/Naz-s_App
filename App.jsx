import React from 'react';
import { StatusBar } from 'react-native';
import MainNavigator from './src/navigation/MainNavigator';
import { Colors } from './src/constants/Colors';

function App() {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={Colors.background}
      />
      <MainNavigator />
    </>
  );
}

export default App;