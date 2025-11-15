import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { db } from '../db/database';
import { Contact } from '../types/Contact';

interface EditContactModalProps {
  visible: boolean;
  contact: Contact | null;
  onClose: () => void;
  onContactUpdated: () => void;
}

export default function EditContactModal({
  visible,
  contact,
  onClose,
  onContactUpdated,
}: EditContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
    }
  }, [contact]);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên không được để trống');
      return false;
    }

    if (email && !email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!contact || !validateForm()) return;

    try {
      db.runSync(
        'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
        [name.trim(), phone.trim() || null, email.trim() || null, contact.id]
      );

      Alert.alert('Thành công', 'Đã cập nhật liên hệ');
      onContactUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating contact:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật liên hệ');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sửa liên hệ</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
              />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  closeButton: { fontSize: 24, color: '#666' },

  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  required: { color: '#ff3b30' },
  input: {
    borderWidth: 1, borderColor: '#ddd', padding: 12,
    borderRadius: 8, fontSize: 16, backgroundColor: '#f9f9f9',
  },

  buttonGroup: { flexDirection: 'row', paddingHorizontal: 20, gap: 12 },
  button: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0' },
  cancelButtonText: { fontSize: 16, color: '#666' },
  saveButton: { backgroundColor: '#007AFF' },
  saveButtonText: { fontSize: 16, color: '#fff' },
});
