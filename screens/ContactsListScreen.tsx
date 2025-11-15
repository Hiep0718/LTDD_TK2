// screens/ContactsListScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { db } from '../db/database';
import { Contact } from '../types/Contact';
import AddContactModal from '../components/AddContactModal';

export default function ContactsListScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const loadContacts = () => {
    try {
      const result = db.getAllSync<Contact>('SELECT * FROM contacts ORDER BY name ASC');
      setContacts(result || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const renderContact = ({ item }: { item: Contact }) => (
    <View style={styles.contactItem}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>
          {item.name} {item.favorite === 1 && '⭐'}
        </Text>

        {item.phone ? (
          <Text style={styles.contactPhone}>{item.phone}</Text>
        ) : null}

        {item.email ? (
          <Text style={styles.contactPhone}>{item.email}</Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
          accessible
          accessibilityLabel="Thêm liên hệ"
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Empty state */}
      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📱</Text>
          <Text style={styles.emptyTitle}>Chưa có liên hệ nào</Text>
          <Text style={styles.emptySubtitle}>
            Nhấn nút + để thêm liên hệ mới
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add contact modal */}
      <AddContactModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onContactAdded={loadContacts}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 30,
  },

  listContent: { padding: 16 },

  contactItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  contactInfo: { flex: 1 },

  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },

  contactPhone: { fontSize: 14, color: '#666' },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },

  emptyText: { fontSize: 64, marginBottom: 16 },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
