import { SafeAreaView, StyleSheet, Text } from 'react-native';

function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ecommerce App</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',  // set background
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#111111',            // set text color
    fontSize: 28,
    fontWeight: '700',
  },
});

export default App;