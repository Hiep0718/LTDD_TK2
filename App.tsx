// App.tsx
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { initDatabase } from './db/init';
import ContactsListScreen from './screens/ContactsListScreen';

export default function App() {
  useEffect(() => {
    (async () => {
      await initDatabase();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ContactsListScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
