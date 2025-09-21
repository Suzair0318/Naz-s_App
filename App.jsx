import React, { useEffect } from 'react';
import { StatusBar, Text, TextInput } from 'react-native';
import MainNavigator from './src/navigation/MainNavigator';
import { Colors } from './src/constants/Colors';
import { Fonts } from './src/constants/Fonts';
import useAuthStore from './src/store/authStore';
// Notifications removed per user request

function App() {
  const loadSession = useAuthStore((s) => s.loadSession);

  useEffect(() => {
    // Restore token/user from storage on app start
    loadSession();
    // Notifications removed; nothing to initialize
  }, [loadSession]);

  // Apply global default font families for Text & TextInput
  // This ensures consistent typography without changing every component manually.
  if (Text && Text.defaultProps == null) {
    Text.defaultProps = {};
  }
  if (Text) {
    const base = Text.defaultProps?.style || {};
    Text.defaultProps.style = [base, { fontFamily: Fonts.families.body }];
  }
  if (TextInput && TextInput.defaultProps == null) {
    TextInput.defaultProps = {};
  }
  if (TextInput) {
    const baseInput = TextInput.defaultProps?.style || {};
    TextInput.defaultProps.style = [baseInput, { fontFamily: Fonts.families.body }];
  }

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