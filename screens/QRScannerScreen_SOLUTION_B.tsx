// MyCrew React Native - QR Scanner Screen
// SOLUTION B: Implementation avec expo-camera + vision-camera-code-scanner
// IMPORTANT: Nécessite l'installation de: 
// npm install expo-camera react-native-vision-camera vision-camera-code-scanner

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
import { CameraView, Camera } from 'expo-camera';
import { useNavigation, StackNavigationProp } from '@react-navigation/native';
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
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [torch, setTorch] = useState(false);
  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestCameraPermission();
    startScanAnimation();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission caméra requise',
          'Cette application a besoin d\'accéder à votre caméra pour scanner les codes QR.',
          [
            { text: 'Annuler', onPress: () => navigation.goBack() },
            { text: 'Paramètres', onPress: () => Camera.requestCameraPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur demande permission:', error);
      navigation.goBack();
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

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);

    try {
      // Vibration et haptic feedback
      Vibration.vibrate(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('📱 QR Code scanné:', { type, data });
      
      // Vérifier si c'est un QR code MyCrew
      if (!QRCodeService.isMyCyewQRCode(data)) {
        Alert.alert(
          'QR Code non reconnu',
          'Ce QR code ne contient pas de données MyCrew valides.',
          [{ text: 'OK', onPress: () => resetScanner() }]
        );
        return;
      }

      // Parser les données QR
      const contact = QRCodeService.parseQRData(data);
      
      if (!contact) {
        Alert.alert(
          'Erreur de lecture',
          'Impossible de lire les données du QR code.',
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
          { text: 'Continuer scan', onPress: () => resetScanner() }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur ajout contact:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter le contact.',
        [{ text: 'OK', onPress: () => resetScanner() }]
      );
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setIsProcessing(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={MyCrewColors.accent} />
        <Text style={styles.loadingText}>Demande d'autorisation...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="camera-off" size={64} color={MyCrewColors.iconMuted} />
        <Text style={styles.errorTitle}>Caméra non autorisée</Text>
        <Text style={styles.errorText}>
          L'accès à la caméra est nécessaire pour scanner les codes QR.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Autoriser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.scanner}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      
      {/* Overlay avec zone de scan */}
      <View style={styles.overlay}>
        {/* Titre */}
        <View style={styles.header}>
          <Text style={styles.title}>Scanner un QR Code MyCrew</Text>
          <Text style={styles.subtitle}>
            Positionnez le QR code dans le cadre
          </Text>
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
            Scannez un QR code partagé par un autre utilisateur MyCrew
          </Text>
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
            style={styles.torchButton}
            onPress={() => setTorch(!torch)}
          >
            <Ionicons 
              name={torch ? "flashlight" : "flashlight-outline"} 
              size={24} 
              color={MyCrewColors.white} 
            />
          </TouchableOpacity>
          
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
  torchButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
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
});

// INSTRUCTIONS D'INSTALLATION :
// npm install expo-camera react-native-vision-camera vision-camera-code-scanner
//
// Ajouter dans app.json:
// "plugins": [
//   [
//     "expo-camera",
//     {
//       "cameraPermission": "Permettre à MyCrew d'accéder à votre caméra pour scanner les codes QR."
//     }
//   ]
// ]