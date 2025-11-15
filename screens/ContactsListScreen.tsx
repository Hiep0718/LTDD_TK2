import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { db } from '../db/database';
import { Contact } from '../types/Contact';
import AddContactModal from '../components/AddContactModal';
import EditContactModal from '../components/EditContactModal';

export default function ContactsListScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // 👉 Search text
  const [searchQuery, setSearchQuery] = useState('');

  // 👉 Toggle filter favorites
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const loadContacts = useCallback(() => {
    try {
      const result = db.getAllSync<Contact>('SELECT * FROM contacts ORDER BY name ASC');
      setContacts(result || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const toggleFavorite = (contact: Contact) => {
    try {
      const newFavorite = contact.favorite === 1 ? 0 : 1;
      db.runSync('UPDATE contacts SET favorite = ? WHERE id = ?', [
        newFavorite,
        contact.id,
      ]);
      loadContacts();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật yêu thích');
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa liên hệ "${contact.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteContact(contact.id),
        },
      ]
    );
  };

  const deleteContact = (id: number) => {
    try {
      db.runSync('DELETE FROM contacts WHERE id = ?', [id]);
      Alert.alert('Thành công', 'Đã xóa liên hệ');
      loadContacts();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xóa liên hệ');
    }
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditModalVisible(true);
  };

  // 👉 Tối ưu lọc bằng useMemo
  const filteredContacts = useMemo(() => {
    const lower = searchQuery.toLowerCase();

    return contacts.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(lower) ||
        (c.phone && c.phone.includes(lower));

      const matchesFavorite = showFavoritesOnly ? c.favorite === 1 : true;

      return matchesSearch && matchesFavorite;
    });
  }, [contacts, searchQuery, showFavoritesOnly]);

  const renderContact = useCallback(
    ({ item }: { item: Contact }) => (
      <TouchableOpacity
        style={styles.contactItem}
        onLongPress={() => handleEditContact(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.phone ? (
            <Text style={styles.contactPhone}>{item.phone}</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditContact(item)}
          >
            <Text style={styles.actionIcon}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteContact(item)}
          >
            <Text style={[styles.actionIcon, styles.deleteIcon]}>🗑️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item)}
          >
            <Text style={styles.favoriteIcon}>
              {item.favorite === 1 ? '⭐' : '☆'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR + FAVORITE FILTER */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm kiếm theo tên hoặc số..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <TouchableOpacity
          style={[
            styles.favoriteFilterButton,
            showFavoritesOnly && { backgroundColor: '#ffce00' },
          ]}
          onPress={() => setShowFavoritesOnly((prev) => !prev)}
        >
          <Text style={{ fontSize: 18 }}>
            {showFavoritesOnly ? '⭐ On' : '☆ Fav'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {filteredContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>📱</Text>
          <Text style={styles.emptyTitle}>Không tìm thấy liên hệ</Text>
          <Text style={styles.emptySubtitle}>Thử tìm từ khóa khác</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* MODALS */}
      <AddContactModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onContactAdded={loadContacts}
      />

      <EditContactModal
        visible={isEditModalVisible}
        contact={selectedContact}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedContact(null);
        }}
        onContactUpdated={loadContacts}
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
  headerTitle: { fontSize: 24, fontWeight: 'bold' },

  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  favoriteFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },

  listContent: { padding: 16 },

  contactItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: { fontSize: 16, fontWeight: '600' },
  contactPhone: { fontSize: 14, color: '#555', marginTop: 4 },

  actions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8, marginRight: 8 },
  actionIcon: { fontSize: 20 },
  deleteIcon: { color: '#ff3b30' },

  favoriteButton: { padding: 8 },
  favoriteIcon: { fontSize: 24 },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: { fontSize: 28, color: '#fff', fontWeight: '300' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 64 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
});
