import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import MainNavigator from './src/navigation/MainNavigator';
import { Colors } from './src/constants/Colors';
import useAuthStore from './src/store/authStore';

function App() {
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    // Restore token/user from storage on app start
    loadSession();
  }, [loadSession]);

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