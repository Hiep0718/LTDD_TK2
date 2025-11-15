import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  SafeAreaView,
  RefreshControl,
  Modal, // Đảm bảo đã import Modal
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useContacts } from "../hooks/useContacts";
import { Contact } from "../types/Contact";

export default function ContactListScreen() {
  const {
    contacts,
    searchContacts,
    toggleFavorite,
    deleteContact,
    importFromAPI,
    insertContact,
    updateContact, // ✅ Cần lấy hàm này ra để dùng
  } = useContacts();

  const [searchText, setSearchText] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [importing, setImporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- STATE CHO MODAL (Dùng chung cho Thêm và Sửa) ---
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null); // Nếu null là Thêm, có dữ liệu là Sửa
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const filtered = useMemo(() => {
    return searchContacts(searchText, favoritesOnly);
  }, [searchText, favoritesOnly, contacts]);

  // --- XỬ LÝ LOGIC ---

  const handleImport = async () => {
    setImporting(true);
    const result = await importFromAPI();
    setImporting(false);
    if (result.success) {
      Alert.alert("Thành công", `Đã thêm ${result.importedCount} danh bạ.`);
    } else {
      Alert.alert("Lỗi", "Không thể kết nối API.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await importFromAPI(); 
    setRefreshing(false);
  };

  // Mở Modal để THÊM MỚI
  const openAddModal = () => {
    setEditingContact(null); // Reset chế độ sửa
    setName("");
    setPhone("");
    setEmail("");
    setModalVisible(true);
  };

  // Mở Modal để SỬA
  const openEditModal = (contact: Contact) => {
    setEditingContact(contact); // Lưu contact đang sửa
    setName(contact.name);
    setPhone(contact.phone || "");
    setEmail(contact.email || "");
    setModalVisible(true);
  };

  // Lưu dữ liệu (Xử lý cả Thêm và Sửa)
  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Thiếu thông tin", "Tên và Số điện thoại là bắt buộc!");
      return;
    }

    let success = false;

    if (editingContact) {
      // Đang ở chế độ Sửa
      success = updateContact(editingContact.id, name.trim(), phone.trim(), email.trim());
    } else {
      // Đang ở chế độ Thêm mới
      success = insertContact(name.trim(), phone.trim(), email.trim());
    }

    if (success) {
      setModalVisible(false);
    } else {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh bạ</Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#ffaa00" }]}
            disabled={importing}
            onPress={handleImport}
          >
            <Text style={styles.btnText}>{importing ? "..." : "⬇"}</Text>
          </TouchableOpacity>

          {/* Nút mở Modal Thêm mới */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: "#28a745" }]}
            onPress={openAddModal}
          >
            <Text style={styles.btnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SEARCH & FILTER */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <TouchableOpacity
        style={styles.filterBtn}
        onPress={() => setFavoritesOnly(!favoritesOnly)}
      >
        <Text style={{ color: "#007AFF", fontWeight: "600" }}>
          {favoritesOnly ? "⭐ Đang xem mục yêu thích" : "☆ Xem tất cả"}
        </Text>
      </TouchableOpacity>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={{ fontSize: 20, color: "#888" }}>Không có dữ liệu</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>

            <View style={styles.actions}>
              {/* Nút Yêu thích */}
              <TouchableOpacity onPress={() => toggleFavorite(item)}>
                <Text style={styles.actionIcon}>
                  {item.favorite ? "❤️" : "🤍"}
                </Text>
              </TouchableOpacity>

              {/* ✅ NÚT SỬA (Mới thêm) */}
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>

              {/* Nút Xóa */}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Xóa", `Bạn muốn xóa ${item.name}?`, [
                    { text: "Hủy" },
                    { text: "Xóa", style: "destructive", onPress: () => deleteContact(item.id) },
                  ])
                }
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ✅ MODAL (Giao diện nhập liệu) */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingContact ? "Sửa liên hệ" : "Thêm liên hệ mới"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên (Bắt buộc)"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại (Bắt buộc)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnTextSmall}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleSave}
              >
                <Text style={styles.btnTextSmall}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  searchInput: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterBtn: { alignItems: "flex-end", marginRight: 12, marginBottom: 8 },
  
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  phone: { color: "#666", marginTop: 4 },
  actions: { flexDirection: "row", gap: 15 },
  actionIcon: { fontSize: 20 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: { flexDirection: "row", gap: 10, marginTop: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, alignItems: "center" },
  btnCancel: { backgroundColor: "#888" },
  btnSave: { backgroundColor: "#007AFF" },
  btnTextSmall: { color: "#fff", fontWeight: "600", fontSize: 16 },
});