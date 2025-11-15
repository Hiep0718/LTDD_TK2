// components/AddContactModal.tsx
import React, { useState } from 'react';
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

interface AddContactModalProps {
  visible: boolean;
  onClose: () => void;
  onContactAdded: () => void;
}

export default function AddContactModal({
  visible,
  onClose,
  onContactAdded,
}: AddContactModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
  };

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
    if (!validateForm()) return;

    try {
      const now = Date.now();
      // Sử dụng runSync theo cấu trúc db hiện tại của bạn
      db.runSync(
        'INSERT INTO contacts (name, phone, email, favorite, created_at) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), phone.trim() || null, email.trim() || null, 0, now]
      );

      Alert.alert('Thành công', 'Đã thêm liên hệ mới');
      resetForm();
      onContactAdded();
      onClose();
    } catch (error) {
      console.error('Error adding contact:', error);
      Alert.alert('Lỗi', 'Không thể thêm liên hệ');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm liên hệ mới</Text>
            <TouchableOpacity onPress={handleClose} accessible accessibilityLabel="Đóng">
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên"
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                style={styles.input}
                keyboardType="phone-pad"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="done"
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                accessible
                accessibilityLabel="Hủy"
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                accessible
                accessibilityLabel="Lưu"
              >
                <Text style={styles.saveButtonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff3b30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonGroup: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
