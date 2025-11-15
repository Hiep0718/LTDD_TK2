// App.tsx
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { initDatabase } from './db/init';
import { db } from './db/database';

export default function App() {
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      await initDatabase();
      await loadContacts();
    })();
  }, []);

  const loadContacts = async () => {
    const rows = await db.getAllAsync('SELECT * FROM contacts ORDER BY id DESC');
    setContacts(rows);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>Danh sách liên hệ</Text>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>SĐT: {item.phone}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Favorite: {item.favorite === 1 ? '⭐' : '—'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
});
