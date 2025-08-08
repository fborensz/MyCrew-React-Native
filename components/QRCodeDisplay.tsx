// MyCrew React Native - QR Code Display Component
// Reusable component for displaying QR codes

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Contact, UserProfile } from '../types';
import { QRCodeService } from '../services/QRCodeService';
import { MyCrewColors } from '../constants/Colors';

interface QRCodeDisplayProps {
  contact?: Contact;
  profile?: UserProfile;
  size?: number;
  showTitle?: boolean;
  title?: string;
  showDebugInfo?: boolean;
}

export default function QRCodeDisplay({ 
  contact, 
  profile, 
  size = 200, 
  showTitle = true,
  title,
  showDebugInfo = false
}: QRCodeDisplayProps) {
  // Generate QR data based on what we have
  const qrData = React.useMemo(() => {
    if (contact) {
      return QRCodeService.generateContactQRData(contact);
    } else if (profile) {
      return QRCodeService.generateProfileQRData(profile);
    }
    return '';
  }, [contact, profile]);

  // Generate display title
  const displayTitle = React.useMemo(() => {
    if (title) return title;
    if (contact) return `QR Code - ${contact.firstName} ${contact.lastName}`;
    if (profile) return `Mon QR Code`;
    return 'QR Code';
  }, [title, contact, profile]);

  // If no data to display
  if (!qrData) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={[styles.errorContainer, { width: size, height: size }]}>
          <Text style={styles.errorText}>Aucune donnée à afficher</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <Text style={styles.title}>{displayTitle}</Text>
      )}
      
      <View style={[styles.qrContainer, { width: size + 40, height: size + 40 }]}>
        <QRCode
          value={qrData}
          size={size}
          color={MyCrewColors.textPrimary}
          backgroundColor={MyCrewColors.background}
          logoSize={30}
          logoMargin={2}
          logoBorderRadius={15}
        />
      </View>

      {/* Display contact info below QR code */}
      {contact && (
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{contact.firstName} {contact.lastName}</Text>
          <Text style={styles.jobText}>{contact.jobTitle}</Text>
          {contact.phone && (
            <Text style={styles.detailText}>📞 {contact.phone}</Text>
          )}
          {contact.email && (
            <Text style={styles.detailText}>📧 {contact.email}</Text>
          )}
        </View>
      )}

      {profile && (
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.jobText}>{profile.jobTitle}</Text>
          {profile.phoneNumber && (
            <Text style={styles.detailText}>📞 {profile.phoneNumber}</Text>
          )}
          {profile.email && (
            <Text style={styles.detailText}>📧 {profile.email}</Text>
          )}
        </View>
      )}

      {/* Debug info - shows QR content */}
      {showDebugInfo && qrData && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>🐛 Contenu du QR Code (Debug)</Text>
          <ScrollView style={styles.debugScrollView} nestedScrollEnabled={true}>
            <Text style={styles.debugText}>{qrData}</Text>
          </ScrollView>
          <Text style={styles.debugFooter}>
            Taille: {qrData.length} caractères
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: MyCrewColors.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  errorContainer: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  errorText: {
    color: MyCrewColors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 20,
    alignItems: 'center',
    maxWidth: 300,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: MyCrewColors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  jobText: {
    fontSize: 16,
    color: MyCrewColors.accent,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  detailText: {
    fontSize: 14,
    color: MyCrewColors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  debugContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    maxWidth: 350,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  debugScrollView: {
    maxHeight: 150,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 14,
  },
  debugFooter: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});