// MyCrew React Native - Export Modal Component
// Modal pour sélectionner le format d'export (QR, JSON, CSV, Text)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { MyCrewColors } from '../constants/Colors';
import { Contact, UserProfile, RootStackParamList } from '../types';
import { ExportService, ExportFormat } from '../services/ExportService';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');

interface ExportModalProps {
  visible: boolean;
  onClose: () => void;
  data: Contact | UserProfile | Contact[];
  type: 'contact' | 'profile' | 'contacts';
  // Filtres actifs pour les exports multi-contacts
  filters?: {
    job: string | null;
    country: string | null;
    regions: string[];
    isHoused: boolean;
    isLocalResident: boolean;
    hasVehicle: boolean;
  };
  searchText?: string;
}

export default function ExportModal({ visible, onClose, data, type, filters, searchText }: ExportModalProps) {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState<string>('');
  const [hasExported, setHasExported] = useState(false);

  const handleQRCodePress = () => {
    let qrData = '';
    
    if (type === 'contact' && !Array.isArray(data)) {
      qrData = ExportService.exportContactForQR(data as Contact);
      setQrValue(qrData);
      setShowQR(true);
    } else if (type === 'profile' && !Array.isArray(data)) {
      qrData = ExportService.exportProfileForQR(data as UserProfile);
      setQrValue(qrData);
      setShowQR(true);
    } else if (type === 'contacts' && Array.isArray(data)) {
      // Check if any filters are applied
      const hasFilters = filters && (
        filters.job ||
        filters.country ||
        filters.regions.length > 0 ||
        filters.isHoused ||
        filters.isLocalResident ||
        filters.hasVehicle
      );

      const hasSearchText = searchText && searchText.trim().length > 0;

      if (!hasFilters && !hasSearchText) {
        Alert.alert(
          'Filtres requis', 
          'Appliquez des filtres avant d\'exporter une liste de contacts'
        );
        return;
      }

      // Multi-contact QR - navigate to selection screen with filters
      onClose(); // Close current modal first
      navigation.navigate('MultiQRExport', {
        filters,
        searchText
      });
    } else {
      Alert.alert('Erreur', 'Type de données non supporté pour QR code');
      return;
    }
  };

  const handleFormatSelect = (format: ExportFormat) => {
    if (format === 'qr') {
      handleQRCodePress();
    } else {
      setSelectedFormat(selectedFormat === format ? null : format);
    }
  };

  const handleExport = async () => {
    if (!selectedFormat) return;
    
    setIsExporting(true);
    
    try {
      let content = '';
      let mimeType = '';
      
      if (Array.isArray(data)) {
        // Multiple contacts
        switch (selectedFormat) {
          case 'json':
            content = ExportService.exportToJSON(data, 'contacts');
            mimeType = 'application/json';
            break;
          case 'csv':
            content = ExportService.exportToCSV(data);
            mimeType = 'text/csv';
            break;
          case 'text':
            content = ExportService.exportToText(data);
            mimeType = 'text/plain';
            break;
        }
      } else {
        // Single contact or profile
        switch (selectedFormat) {
          case 'json':
            content = ExportService.exportToJSON(data, type);
            mimeType = 'application/json';
            break;
          case 'csv':
            const contactsArray = Array.isArray(data) ? data : [data as Contact];
            content = ExportService.exportToCSV(contactsArray);
            mimeType = 'text/csv';
            break;
          case 'text':
            const contactsForText = Array.isArray(data) ? data : [data as Contact];
            content = ExportService.exportToText(contactsForText);
            mimeType = 'text/plain';
            break;
        }
      }
      
      const filename = ExportService.generateFilename(selectedFormat, type);
      await ExportService.saveAndShareFile(content, filename, mimeType);
      
      setHasExported(true);
      Alert.alert('Succès', 'Export réalisé avec succès!');
      onClose();
      
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'export. Veuillez réessayer.');
    } finally {
      setIsExporting(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'contact':
        return 'Exporter le contact';
      case 'profile':
        return 'Exporter le profil';
      case 'contacts':
        return Array.isArray(data) ? `Exporter ${data.length} contacts` : 'Exporter les contacts';
      default:
        return 'Exporter';
    }
  };

  const isQRAvailable = true; // Now available for all types including multi-contacts

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {
        setHasExported(false);
        setSelectedFormat(null);
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            <TouchableOpacity onPress={() => {
              setHasExported(false);
              setSelectedFormat(null);
              onClose();
            }} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* QR Code Section */}
          {isQRAvailable && (
            <View style={styles.qrSection}>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={handleQRCodePress}
              >
                <View style={styles.qrIcon}>
                  <Ionicons name="qr-code" size={60} color={MyCrewColors.accent} />
                </View>
                <Text style={styles.qrButtonText}>
                  {type === 'contacts' ? 'QR Multi-Contacts' : 'QR Code'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Separator */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* File Format Options */}
          <View style={styles.formatsSection}>
            <Text style={styles.formatsTitle}>Formats de fichier :</Text>
            
            <TouchableOpacity
              style={[
                styles.formatOption,
                selectedFormat === 'json' && styles.formatOptionSelected
              ]}
              onPress={() => handleFormatSelect('json')}
            >
              <View style={styles.formatIcon}>
                <Ionicons 
                  name={selectedFormat === 'json' ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={selectedFormat === 'json' ? MyCrewColors.accent : MyCrewColors.iconMuted} 
                />
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatName}>JSON</Text>
                <Text style={styles.formatDescription}>Format structuré, réimportable</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatOption,
                selectedFormat === 'csv' && styles.formatOptionSelected
              ]}
              onPress={() => handleFormatSelect('csv')}
            >
              <View style={styles.formatIcon}>
                <Ionicons 
                  name={selectedFormat === 'csv' ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={selectedFormat === 'csv' ? MyCrewColors.accent : MyCrewColors.iconMuted} 
                />
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatName}>CSV</Text>
                <Text style={styles.formatDescription}>Tableur, Excel compatible</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.formatOption,
                selectedFormat === 'text' && styles.formatOptionSelected
              ]}
              onPress={() => handleFormatSelect('text')}
            >
              <View style={styles.formatIcon}>
                <Ionicons 
                  name={selectedFormat === 'text' ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={selectedFormat === 'text' ? MyCrewColors.accent : MyCrewColors.iconMuted} 
                />
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatName}>Texte</Text>
                <Text style={styles.formatDescription}>Texte lisible, partage facile</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[
              styles.exportButton,
              (!selectedFormat || isExporting) && styles.exportButtonDisabled
            ]}
            onPress={handleExport}
            disabled={!selectedFormat || isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={MyCrewColors.background} />
            ) : (
              <Text style={styles.exportButtonText}>Exporter</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Display Modal */}
      {showQR && (
        <Modal
          visible={showQR}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowQR(false)}
        >
          <View style={styles.qrModalOverlay}>
            <View style={styles.qrModal}>
              <View style={styles.qrModalHeader}>
                <Text style={styles.qrModalTitle}>QR Code</Text>
                <TouchableOpacity onPress={() => setShowQR(false)}>
                  <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={qrValue}
                  size={200}
                  backgroundColor="white"
                  color="black"
                />
              </View>
              
              <Text style={styles.qrInstructions}>
                Scannez ce QR code avec l'app MyCrew pour importer {type === 'profile' ? 'ce profil' : 'ce contact'}
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  qrButton: {
    alignItems: 'center',
    gap: 8,
  },
  qrIcon: {
    width: 80,
    height: 80,
    backgroundColor: `${MyCrewColors.accent}10`,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${MyCrewColors.accent}30`,
  },
  qrButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: MyCrewColors.accent,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: MyCrewColors.border,
  },
  separatorText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: MyCrewColors.textSecondary,
    fontStyle: 'italic',
  },
  formatsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formatsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: 16,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  formatOptionSelected: {
    backgroundColor: `${MyCrewColors.accent}10`,
  },
  formatIcon: {
    marginRight: 12,
  },
  formatInfo: {
    flex: 1,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '500',
    color: MyCrewColors.textPrimary,
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 13,
    color: MyCrewColors.textSecondary,
  },
  exportButton: {
    backgroundColor: MyCrewColors.accent,
    paddingVertical: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonDisabled: {
    backgroundColor: MyCrewColors.iconMuted,
  },
  exportButtonText: {
    color: MyCrewColors.cardBackground,
    fontSize: 16,
    fontWeight: '600',
  },
  // QR Code Modal styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrModal: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center',
    maxWidth: width * 0.85,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  qrCodeContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
  },
  qrInstructions: {
    textAlign: 'center',
    fontSize: 14,
    color: MyCrewColors.textSecondary,
    lineHeight: 20,
    maxWidth: 250,
  },
});