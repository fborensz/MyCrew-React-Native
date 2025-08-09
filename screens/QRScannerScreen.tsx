// MyCrew React Native - QR Scanner Screen 
// Scanner caméra direct avec expo-camera

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { MyCrewColors, Typography, Spacing } from '../constants/Colors';
import { QRCodeService } from '../services/QRCodeService';
import { DatabaseService } from '../services/DatabaseService';
import { Contact, RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

type NavigationProp = StackNavigationProp<RootStackParamList, 'QRScanner'>;

export default function QRScannerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startScanAnimation();
  }, []);

  // Demander automatiquement les permissions dès que possible
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestCameraPermissionAuto();
    }
  }, [permission]);

  const requestCameraPermissionAuto = async () => {
    console.log('🎥 Demande automatique de permission caméra...');
    try {
      const result = await requestPermission();
      if (!result.granted) {
        // Si refusé, proposer de réessayer
        Alert.alert(
          'Permission caméra requise',
          'Cette application a besoin d\'accéder à votre caméra pour scanner les codes QR.',
          [
            { text: 'Annuler', onPress: () => navigation.goBack() },
            { text: 'Réessayer', onPress: requestCameraPermissionAuto }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
    }
  };

  const startScanAnimation = () => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
  };

  const handleBarCodeScanned = async (result: any) => {
    const { type, data } = result;
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);

    try {
      // Vibration et haptic feedback
      Vibration.vibrate(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('📱 QR Code scanné:', { type, data });
      
      // Debug: Afficher les premières données
      console.log('🔍 Données brutes (100 premiers caractères):', data.substring(0, 100));
      
      // Vérifier si c'est un QR code MyCrew
      if (!QRCodeService.isMyCyewQRCode(data)) {
        Alert.alert(
          'QR Code non reconnu',
          'Ce QR code ne contient pas de données MyCrew valides. Assurez-vous de scanner un QR code généré par l\'application MyCrew.',
          [{ text: 'OK', onPress: () => resetScanner() }]
        );
        return;
      }

      // Détecter le type de QR code
      const qrType = QRCodeService.getQRType(data);
      console.log('🔍 Type QR détecté:', qrType);

      if (qrType === 'single') {
        await handleSingleContactQR(data);
      } else if (qrType === 'multi') {
        await handleMultiContactQR(data);
      } else {
        Alert.alert(
          'Format non supporté',
          'Ce QR code ne contient pas de données MyCrew valides.',
          [{ text: 'OK', onPress: () => resetScanner() }]
        );
      }

    } catch (error) {
      console.error('❌ Erreur traitement QR:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du traitement du QR code.',
        [{ text: 'OK', onPress: () => resetScanner() }]
      );
    }
  };

  const handleSingleContactQR = async (data: string) => {
    // Parser les données QR
    const contact = QRCodeService.parseQRData(data);
    
    if (!contact) {
      Alert.alert(
        'Erreur de lecture',
        'Impossible de lire les données du QR code. Le format pourrait être corrompu.',
        [{ text: 'OK', onPress: () => resetScanner() }]
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
          { text: 'Scanner à nouveau', onPress: () => resetScanner() }
        ]
      );
      return;
    }

    // Prévisualiser et confirmer l'ajout
    const contactInfo = QRCodeService.getQRPreviewInfo(data);
    if (contactInfo) {
      Alert.alert(
        'Nouveau contact détecté',
        `${contactInfo.name}\n${contactInfo.jobTitle}\n\nVoulez-vous ajouter ce contact ?`,
        [
          { text: 'Non', onPress: () => resetScanner() },
          { text: 'Oui', onPress: () => addContact(contact) }
        ]
      );
    } else {
      // Fallback si pas de preview
      Alert.alert(
        'Ajouter ce contact ?',
        `${contact.firstName} ${contact.lastName} sera ajouté à vos contacts.`,
        [
          { text: 'Non', onPress: () => resetScanner() },
          { text: 'Oui', onPress: () => addContact(contact) }
        ]
      );
    }
  };

  const handleMultiContactQR = async (data: string) => {
    // Parser les données QR multi-contacts
    const result = QRCodeService.parseMultiContactQRData(data);
    
    if (!result.success || !result.contacts) {
      Alert.alert(
        'Erreur de lecture',
        result.error || 'Impossible de lire les contacts du QR code.',
        [{ text: 'OK', onPress: () => resetScanner() }]
      );
      return;
    }

    const contacts = result.contacts;
    console.log(`📝 ${contacts.length} contacts détectés dans le QR code`);

    // Vérifier les contacts existants
    const db = DatabaseService.getInstance();
    const existingContacts: string[] = [];
    const newContacts: Contact[] = [];

    for (const contact of contacts) {
      const existing = await db.findContactByNameAndPhone(
        `${contact.firstName} ${contact.lastName}`,
        contact.phone
      );
      if (existing) {
        existingContacts.push(`${contact.firstName} ${contact.lastName}`);
      } else {
        newContacts.push(contact);
      }
    }

    // Afficher le résumé et proposer l'import
    let message = `${contacts.length} contacts détectés\n\n`;
    
    if (newContacts.length > 0) {
      message += `✅ ${newContacts.length} nouveaux contacts\n`;
    }
    
    if (existingContacts.length > 0) {
      message += `⚠️ ${existingContacts.length} contacts déjà existants\n`;
      if (existingContacts.length <= 3) {
        message += `(${existingContacts.join(', ')})\n`;
      }
    }

    if (newContacts.length === 0) {
      Alert.alert(
        'Aucun nouveau contact',
        'Tous les contacts de ce QR code existent déjà dans votre liste.',
        [{ text: 'OK', onPress: () => resetScanner() }]
      );
      return;
    }

    message += `\nVoulez-vous ajouter les ${newContacts.length} nouveaux contacts ?`;

    Alert.alert(
      'Contacts multiples détectés',
      message,
      [
        { text: 'Non', onPress: () => resetScanner() },
        { text: `Ajouter ${newContacts.length}`, onPress: () => addMultipleContacts(newContacts) }
      ]
    );
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
        isFavorite: false, // Nouveau contact pas en favori par défaut
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
          { text: 'Continuer scan', onPress: () => resetScanner() }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur ajout contact:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter le contact. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => resetScanner() }]
      );
    }
  };

  const addMultipleContacts = async (contacts: Contact[]) => {
    try {
      const db = DatabaseService.getInstance();
      let addedCount = 0;
      const errors: string[] = [];

      for (const contact of contacts) {
        try {
          await db.createContact({
            firstName: contact.firstName,
            lastName: contact.lastName,
            jobTitle: contact.jobTitle,
            phone: contact.phone,
            email: contact.email,
            notes: contact.notes,
            isFavorite: false,
            locations: contact.locations,
          });
          addedCount++;
        } catch (error) {
          console.error('❌ Erreur ajout contact:', contact.firstName, contact.lastName, error);
          errors.push(`${contact.firstName} ${contact.lastName}`);
        }
      }

      if (addedCount === contacts.length) {
        // Tous ajoutés avec succès
        Alert.alert(
          'Contacts ajoutés !',
          `${addedCount} contacts ont été ajoutés avec succès.`,
          [
            { text: 'Voir contacts', onPress: () => {
              navigation.replace('ContactList');
            }},
            { text: 'Continuer scan', onPress: () => resetScanner() }
          ]
        );
      } else {
        // Partiellement réussi
        Alert.alert(
          'Import partiel',
          `${addedCount}/${contacts.length} contacts ajoutés.\n\nErreurs: ${errors.join(', ')}`,
          [{ text: 'OK', onPress: () => resetScanner() }]
        );
      }

    } catch (error) {
      console.error('❌ Erreur ajout multiple contacts:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter les contacts. Veuillez réessayer.',
        [{ text: 'OK', onPress: () => resetScanner() }]
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setIsProcessing(false);
  };

  // Chargement des permissions
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={MyCrewColors.accent} />
        <Text style={styles.loadingText}>🎥 Initialisation de la caméra...</Text>
        <Text style={styles.loadingSubText}>
          Une demande d'autorisation va apparaître
        </Text>
      </View>
    );
  }

  // Si permission refusée définitivement
  if (!permission.granted && !permission.canAskAgain) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="settings-outline" size={80} color={MyCrewColors.accent} />
        <Text style={styles.errorTitle}>Permission caméra refusée</Text>
        <Text style={styles.errorText}>
          Pour utiliser le scanner, activez les permissions caméra dans les paramètres de votre appareil.
        </Text>
        <Text style={styles.settingsInstructions}>
          Paramètres → Apps → Expo Go → Autorisations → Caméra
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // En attente de permission (la demande va se faire automatiquement)
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={MyCrewColors.accent} />
        <Text style={styles.loadingText}>🎥 Demande d'autorisation...</Text>
        <Text style={styles.loadingSubText}>
          Veuillez autoriser l'accès à la caméra
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.scanner}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* Overlay avec zone de scan */}
      <View style={styles.overlay}>
        {/* Titre */}
        <View style={styles.header}>
          <Text style={styles.title}>📱 Scanner QR Code</Text>
          <Text style={styles.subtitle}>
            Pointez la caméra vers un QR code MyCrew
          </Text>
          {scanned && (
            <Text style={styles.scannedText}>✅ QR Code détecté !</Text>
          )}
        </View>

        {/* Zone de scan centrale */}
        <View style={styles.scanAreaContainer}>
          {/* Coins du cadre de scan */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          
          {/* Ligne de scan animée */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{
                  translateY: scanAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SCAN_AREA_SIZE - 4],
                  }),
                }],
              },
            ]}
          />
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {isProcessing 
              ? "Traitement du QR code en cours..." 
              : "Scannez un QR code partagé par un autre utilisateur MyCrew"
            }
          </Text>
          
          {/* Boutons de test en mode développement */}
          {__DEV__ && (
            <View style={styles.devButtons}>
              <TouchableOpacity 
                style={styles.testButton}
                onPress={() => {
                  const testQRData = {
                    type: "MyCrew_Contact",
                    version: "1.0",
                    data: {
                      firstName: "Test",
                      lastName: "Scanner", 
                      jobTitle: "Développeur",
                      phone: "0123456789",
                      email: "test@mycrew.fr",
                      notes: "",
                      locations: []
                    }
                  };
                  handleBarCodeScanned({ 
                    type: 'qr', 
                    data: JSON.stringify(testQRData) 
                  });
                }}
              >
                <Text style={styles.testButtonText}>🧪 Test Scan</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.testButton}
                onPress={async () => {
                  const db = DatabaseService.getInstance();
                  const contacts = await db.getAllContacts();
                  if (contacts.length >= 5) {
                    const testContacts = contacts.slice(0, 5);
                    const result = QRCodeService.generateMultiContactQRData(testContacts);
                    if (result.success) {
                      console.log('🧪 Test multi-contact QR généré');
                      handleBarCodeScanned({ 
                        type: 'qr', 
                        data: result.data! 
                      });
                    } else {
                      Alert.alert('Test Error', result.error);
                    }
                  } else {
                    Alert.alert('Test Error', 'Il faut au moins 5 contacts en base');
                  }
                }}
              >
                <Text style={styles.testButtonText}>📊 Test Multi QR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actions}>
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={MyCrewColors.white} />
              <Text style={styles.processingText}>Traitement...</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={MyCrewColors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.black,
  },
  scanner: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
    opacity: 0.8,
  },
  scanAreaContainer: {
    alignSelf: 'center',
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: MyCrewColors.accent,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: MyCrewColors.accent,
    opacity: 0.8,
  },
  instructions: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  instructionText: {
    fontSize: Typography.body,
    color: MyCrewColors.white,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.9,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 20,
    marginRight: Spacing.lg,
  },
  processingText: {
    color: MyCrewColors.white,
    marginLeft: Spacing.sm,
    fontSize: Typography.body,
  },
  closeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MyCrewColors.background,
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
  },
  errorTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  buttonText: {
    color: MyCrewColors.white,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    color: MyCrewColors.accent,
    fontSize: Typography.body,
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelButtonText: {
    color: MyCrewColors.textSecondary,
    fontSize: Typography.body,
    fontWeight: '400',
  },
  scannedText: {
    fontSize: Typography.subheadline,
    color: MyCrewColors.accent,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  devButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  testButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flex: 1,
    maxWidth: 110,
  },
  testButtonText: {
    color: MyCrewColors.white,
    fontSize: Typography.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: Spacing.sm,
    fontSize: Typography.caption,
    color: MyCrewColors.iconMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingsInstructions: {
    fontSize: Typography.caption,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
});