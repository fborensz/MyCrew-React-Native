// MyCrew React Native - QR Scanner Screen
// SOLUTION C: Implementation avec react-native-qrcode-scanner
// IMPORTANT: Nécessite l'installation de: 
// npm install react-native-qrcode-scanner react-native-permissions

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Vibration,
  ActivityIndicator,
} from 'react-native';
// @ts-ignore
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation, StackNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { MyCrewColors, Typography, Spacing } from '../constants/Colors';
import { QRCodeService } from '../services/QRCodeService';
import { DatabaseService } from '../services/DatabaseService';
import { Contact, RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList, 'QRScanner'>;

interface QREvent {
  data: string;
  type: string;
}

export default function QRScannerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const handleQRRead = async (e: QREvent) => {
    if (isProcessing) return;
    
    setIsProcessing(true);

    try {
      // Vibration et haptic feedback
      Vibration.vibrate(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('📱 QR Code scanné:', { type: e.type, data: e.data });
      
      // Vérifier si c'est un QR code MyCrew
      if (!QRCodeService.isMyCyewQRCode(e.data)) {
        Alert.alert(
          'QR Code non reconnu',
          'Ce QR code ne contient pas de données MyCrew valides. Assurez-vous de scanner un QR code généré par l\'application MyCrew.',
          [{ text: 'OK', onPress: () => setIsProcessing(false) }]
        );
        return;
      }

      // Parser les données QR
      const contact = QRCodeService.parseQRData(e.data);
      
      if (!contact) {
        Alert.alert(
          'Erreur de lecture',
          'Impossible de lire les données du QR code. Le format pourrait être corrompu.',
          [{ text: 'OK', onPress: () => setIsProcessing(false) }]
        );
        return;
      }

      // Vérifier si le contact existe déjà
      const db = DatabaseService.getInstance();
      const existingContact = await db.findContactByNameAndPhone(
        `${contact.firstName} ${contact.lastName}`,
        contact.phone
      );

      if (existingContact) {
        Alert.alert(
          'Contact existant',
          `${contact.firstName} ${contact.lastName} existe déjà dans vos contacts.`,
          [
            { text: 'Voir', onPress: () => {
              navigation.replace('ContactDetail', { contactId: existingContact.id });
            }},
            { text: 'Scanner à nouveau', onPress: () => setIsProcessing(false) }
          ]
        );
        return;
      }

      // Prévisualiser et confirmer l'ajout
      const contactInfo = QRCodeService.getQRPreviewInfo(e.data);
      if (contactInfo) {
        Alert.alert(
          'Nouveau contact détecté',
          `${contactInfo.name}\n${contactInfo.jobTitle}\n\nVoulez-vous ajouter ce contact ?`,
          [
            { text: 'Non', onPress: () => setIsProcessing(false) },
            { text: 'Oui', onPress: () => addContact(contact) }
          ]
        );
      } else {
        // Fallback si pas de preview
        Alert.alert(
          'Ajouter ce contact ?',
          `${contact.firstName} ${contact.lastName} sera ajouté à vos contacts.`,
          [
            { text: 'Non', onPress: () => setIsProcessing(false) },
            { text: 'Oui', onPress: () => addContact(contact) }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Erreur traitement QR:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du traitement du QR code.',
        [{ text: 'OK', onPress: () => setIsProcessing(false) }]
      );
    }
  };

  const addContact = async (contact: Contact) => {
    try {
      const db = DatabaseService.getInstance();
      const contactId = await db.createContact({
        firstName: contact.firstName,
        lastName: contact.lastName,
        jobTitle: contact.jobTitle,
        phone: contact.phone,
        email: contact.email,
        notes: contact.notes,
        isFavorite: false,
        locations: contact.locations,
      });

      console.log('✅ Contact ajouté avec succès:', contactId);
      
      Alert.alert(
        'Contact ajouté !',
        `${contact.firstName} ${contact.lastName} a été ajouté à vos contacts.`,
        [
          { text: 'Voir', onPress: () => {
            navigation.replace('ContactDetail', { contactId });
          }},
          { text: 'Continuer scan', onPress: () => setIsProcessing(false) }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur ajout contact:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter le contact. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => setIsProcessing(false) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={handleQRRead}
        flashMode={flashOn ? 'torch' : 'off'}
        topContent={
          <View style={styles.topContent}>
            <Text style={styles.title}>Scanner un QR Code MyCrew</Text>
            <Text style={styles.subtitle}>
              Positionnez le QR code dans le cadre pour l'ajouter automatiquement à vos contacts
            </Text>
          </View>
        }
        bottomContent={
          <View style={styles.bottomContent}>
            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="small" color={MyCrewColors.white} />
                <Text style={styles.processingText}>Traitement en cours...</Text>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, flashOn && styles.actionButtonActive]}
                onPress={() => setFlashOn(!flashOn)}
              >
                <Ionicons 
                  name={flashOn ? "flashlight" : "flashlight-outline"} 
                  size={24} 
                  color={flashOn ? MyCrewColors.accent : MyCrewColors.white} 
                />
                <Text style={[styles.buttonText, flashOn && styles.buttonTextActive]}>
                  Flash
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="close" size={24} color={MyCrewColors.white} />
                <Text style={styles.buttonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.helpText}>
              Scannez un QR code partagé par un autre utilisateur MyCrew pour ajouter automatiquement ses informations de contact.
            </Text>
          </View>
        }
        cameraStyle={styles.camera}
        markerStyle={styles.marker}
        showMarker={true}
        customMarker={
          <View style={styles.customMarkerContainer}>
            {/* Coins du cadre de scan */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.black,
  },
  camera: {
    height: height,
  },
  topContent: {
    flex: 0.3,
    backgroundColor: MyCrewColors.black,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: Typography.title,
    fontWeight: '700',
    color: MyCrewColors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.subheadline,
    color: MyCrewColors.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  bottomContent: {
    flex: 0.3,
    backgroundColor: MyCrewColors.black,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 60,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  processingText: {
    color: MyCrewColors.white,
    marginLeft: Spacing.sm,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    minWidth: 80,
  },
  actionButtonActive: {
    backgroundColor: MyCrewColors.white,
  },
  buttonText: {
    color: MyCrewColors.white,
    fontSize: Typography.small,
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: MyCrewColors.accent,
  },
  helpText: {
    fontSize: Typography.small,
    color: MyCrewColors.white,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
    paddingHorizontal: Spacing.lg,
  },
  marker: {
    borderColor: MyCrewColors.accent,
    borderRadius: 12,
  },
  customMarkerContainer: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: MyCrewColors.accent,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

// INSTRUCTIONS D'INSTALLATION :
// npm install react-native-qrcode-scanner react-native-permissions
//
// Pour iOS, ajouter dans ios/Podfile:
// pod 'react-native-qrcode-scanner', path: '../node_modules/react-native-qrcode-scanner'
//
// Pour Android, ajouter les permissions dans android/app/src/main/AndroidManifest.xml:
// <uses-permission android:name="android.permission.CAMERA" />
// <uses-permission android:name="android.permission.VIBRATE"/>
//
// Ajouter dans app.json si pas déjà présent:
// "android": {
//   "permissions": [
//     "android.permission.CAMERA"
//   ]
// },
// "ios": {
//   "infoPlist": {
//     "NSCameraUsageDescription": "Cette app utilise la caméra pour scanner des codes QR."
//   }
// }