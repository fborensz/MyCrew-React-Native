// MyCrew React Native - QR Code Popup Component
// Popup modal pour afficher un QR Code scannable

import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { ThemedText } from './ThemedText';
import { MyCrewColors } from '../constants/Colors';

interface QRCodePopupProps {
  visible: boolean;
  onClose: () => void;
  data: string;
  title?: string;
}

const { width } = Dimensions.get('window');
const QR_SIZE = Math.min(width * 0.7, 280);

export default function QRCodePopup({ visible, onClose, data, title = "QR Code" }: QRCodePopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} activeOpacity={1} />
        
        <View style={styles.popup}>
          <View style={styles.header}>
            <ThemedText variant="headline" weight="semibold">{title}</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.qrContainer}>
            <QRCode
              value={data}
              size={QR_SIZE}
              color={MyCrewColors.textPrimary}
              backgroundColor={MyCrewColors.background}
            />
          </View>
          
          <ThemedText variant="caption" color="textSecondary" style={styles.instruction}>
            Scannez ce code avec l'appareil photo ou une app QR
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlayTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    backgroundColor: MyCrewColors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instruction: {
    textAlign: 'center',
    maxWidth: QR_SIZE,
  },
});