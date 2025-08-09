// MyCrew React Native - QR Scanner Screen
// SOLUTION D: Implementation hybride avec fallback et détection de format
// Cette solution détecte automatiquement le format des QR codes et propose différentes actions

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
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { useNavigation, StackNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

import { MyCrewColors, Typography, Spacing } from '../constants/Colors';
import { QRCodeService } from '../services/QRCodeService';
import { DatabaseService } from '../services/DatabaseService';
import { Contact, RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

type NavigationProp = StackNavigationProp<RootStackParamList, 'QRScanner'>;

interface QRContent {
  type: 'MyCrew' | 'URL' | 'Email' | 'Phone' | 'WiFi' | 'vCard' | 'Text';
  data: string;
  description: string;
  actions: Array<{
    label: string;
    action: () => void;
    icon: string;
    primary?: boolean;
  }>;
}

export default function QRScannerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrContent, setQrContent] = useState<QRContent | null>(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestCameraPermission();
    startScanAnimation();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission caméra requise',
          'Cette application a besoin d\'accéder à votre caméra pour scanner les codes QR.',
          [
            { text: 'Annuler', onPress: () => navigation.goBack() },
            { text: 'Paramètres', onPress: () => BarCodeScanner.requestPermissionsAsync() }
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

  const analyzeQRContent = (data: string): QRContent => {
    // 1. Vérifier si c'est un QR MyCrew
    if (QRCodeService.isMyCyewQRCode(data)) {
      const contact = QRCodeService.parseQRData(data);
      const preview = QRCodeService.getQRPreviewInfo(data);
      
      return {
        type: 'MyCrew',
        data,
        description: preview ? `Contact MyCrew: ${preview.name} - ${preview.jobTitle}` : 'Contact MyCrew détecté',
        actions: [
          {
            label: 'Ajouter au carnet',
            icon: 'person-add',
            primary: true,
            action: () => contact && handleAddMyCrewContact(contact)
          },
          {
            label: 'Voir détails',
            icon: 'eye',
            action: () => showQRDetails(data)
          }
        ]
      };
    }

    // 2. Vérifier si c'est une URL
    if (data.startsWith('http://') || data.startsWith('https://')) {
      return {
        type: 'URL',
        data,
        description: `Lien web: ${data}`,
        actions: [
          {
            label: 'Ouvrir le lien',
            icon: 'open',
            primary: true,
            action: () => Linking.openURL(data)
          },
          {
            label: 'Copier le lien',
            icon: 'copy',
            action: () => Clipboard.setStringAsync(data)
          }
        ]
      };
    }

    // 3. Vérifier si c'est un email
    if (data.startsWith('mailto:') || data.includes('@') && data.includes('.')) {
      const email = data.replace('mailto:', '');
      return {
        type: 'Email',
        data,
        description: `Adresse email: ${email}`,
        actions: [
          {
            label: 'Envoyer un email',
            icon: 'mail',
            primary: true,
            action: () => Linking.openURL(`mailto:${email}`)
          },
          {
            label: 'Copier l\'email',
            icon: 'copy',
            action: () => Clipboard.setStringAsync(email)
          }
        ]
      };
    }

    // 4. Vérifier si c'est un numéro de téléphone
    if (data.startsWith('tel:') || /^[\+]?[0-9\s\-\(\)]{10,}$/.test(data)) {
      const phone = data.replace('tel:', '');
      return {
        type: 'Phone',
        data,
        description: `Numéro de téléphone: ${phone}`,
        actions: [
          {
            label: 'Appeler',
            icon: 'call',
            primary: true,
            action: () => Linking.openURL(`tel:${phone}`)
          },
          {
            label: 'Envoyer SMS',
            icon: 'chatbubble',
            action: () => Linking.openURL(`sms:${phone}`)
          },
          {
            label: 'Copier le numéro',
            icon: 'copy',
            action: () => Clipboard.setStringAsync(phone)
          }
        ]
      };
    }

    // 5. Vérifier si c'est un WiFi
    if (data.startsWith('WIFI:')) {
      return {
        type: 'WiFi',
        data,
        description: 'Configuration WiFi détectée',
        actions: [
          {
            label: 'Voir les détails',
            icon: 'wifi',
            primary: true,
            action: () => showQRDetails(data)
          },
          {
            label: 'Copier les infos',
            icon: 'copy',
            action: () => Clipboard.setStringAsync(data)
          }
        ]
      };
    }

    // 6. Vérifier si c'est une vCard
    if (data.startsWith('BEGIN:VCARD')) {
      return {
        type: 'vCard',
        data,
        description: 'Carte de contact (vCard) détectée',
        actions: [
          {
            label: 'Voir le contact',
            icon: 'person',
            primary: true,
            action: () => showQRDetails(data)
          },
          {
            label: 'Copier les données',
            icon: 'copy',
            action: () => Clipboard.setStringAsync(data)
          }
        ]
      };
    }

    // 7. Texte générique
    return {
      type: 'Text',
      data,
      description: `Texte: ${data.length > 50 ? data.substring(0, 50) + '...' : data}`,
      actions: [
        {
          label: 'Copier le texte',
          icon: 'copy',
          primary: true,
          action: () => Clipboard.setStringAsync(data)
        },
        {
          label: 'Voir le texte complet',
          icon: 'document-text',
          action: () => showQRDetails(data)
        }
      ]
    };
  };

  const handleBarCodeScanned = async ({ type, data }: BarCodeScannerResult) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);

    try {
      // Vibration et haptic feedback
      Vibration.vibrate(100);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      console.log('📱 QR Code scanné:', { type, data });
      
      // Analyser le contenu
      const content = analyzeQRContent(data);
      setQrContent(content);
      setShowContentModal(true);

    } catch (error) {
      console.error('❌ Erreur traitement QR:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors du traitement du QR code.',
        [{ text: 'OK', onPress: () => resetScanner() }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddMyCrewContact = async (contact: Contact) => {
    try {
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
              setShowContentModal(false);
              navigation.replace('ContactDetail', { contactId: existingContact.id });
            }},
            { text: 'OK', onPress: () => setShowContentModal(false) }
          ]
        );
        return;
      }

      // Ajouter le contact
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
            setShowContentModal(false);
            navigation.replace('ContactDetail', { contactId });
          }},
          { text: 'Continuer', onPress: () => {
            setShowContentModal(false);
            resetScanner();
          }}
        ]
      );

    } catch (error) {
      console.error('❌ Erreur ajout contact:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'ajouter le contact.',
        [{ text: 'OK', onPress: () => setShowContentModal(false) }]
      );
    }
  };

  const showQRDetails = (data: string) => {
    Alert.alert(
      'Contenu du QR Code',
      data,
      [
        { text: 'Copier', onPress: () => Clipboard.setStringAsync(data) },
        { text: 'Fermer' }
      ]
    );
  };

  const resetScanner = () => {
    setScanned(false);
    setIsProcessing(false);
    setQrContent(null);
    setShowContentModal(false);
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
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={styles.scanner}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />
      
      {/* Overlay avec zone de scan */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Scanner QR Code</Text>
          <Text style={styles.subtitle}>
            Compatible avec tous types de QR codes
          </Text>
        </View>

        <View style={styles.scanAreaContainer}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          
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

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Scannez n'importe quel QR code : MyCrew, URL, email, téléphone, WiFi...
          </Text>
        </View>

        <View style={styles.actions}>
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={MyCrewColors.white} />
              <Text style={styles.processingText}>Analyse...</Text>
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

      {/* Modal de contenu QR */}
      <Modal
        visible={showContentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {qrContent && (
              <>
                <View style={styles.modalHeader}>
                  <Ionicons 
                    name={getTypeIcon(qrContent.type)} 
                    size={32} 
                    color={MyCrewColors.accent} 
                  />
                  <Text style={styles.modalTitle}>QR Code détecté</Text>
                  <TouchableOpacity
                    onPress={() => setShowContentModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <Ionicons name="close" size={24} color={MyCrewColors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <Text style={styles.modalDescription}>
                    {qrContent.description}
                  </Text>
                </ScrollView>

                <View style={styles.modalActions}>
                  {qrContent.actions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalActionButton,
                        action.primary && styles.modalActionButtonPrimary
                      ]}
                      onPress={() => {
                        action.action();
                        if (!action.primary) {
                          setShowContentModal(false);
                          resetScanner();
                        }
                      }}
                    >
                      <Ionicons 
                        name={action.icon as any} 
                        size={20} 
                        color={action.primary ? MyCrewColors.white : MyCrewColors.accent} 
                      />
                      <Text style={[
                        styles.modalActionText,
                        action.primary && styles.modalActionTextPrimary
                      ]}>
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.modalScanAgainButton}
                  onPress={resetScanner}
                >
                  <Text style={styles.modalScanAgainText}>
                    Scanner à nouveau
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getTypeIcon(type: QRContent['type']): string {
  switch (type) {
    case 'MyCrew': return 'people';
    case 'URL': return 'link';
    case 'Email': return 'mail';
    case 'Phone': return 'call';
    case 'WiFi': return 'wifi';
    case 'vCard': return 'person';
    case 'Text': return 'document-text';
    default: return 'qr-code';
  }
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  modalContent: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 12,
    padding: Spacing.xl,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginLeft: Spacing.md,
    flex: 1,
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  modalScroll: {
    maxHeight: 120,
    marginBottom: Spacing.lg,
  },
  modalDescription: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    lineHeight: 22,
  },
  modalActions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MyCrewColors.accent,
    backgroundColor: MyCrewColors.background,
  },
  modalActionButtonPrimary: {
    backgroundColor: MyCrewColors.accent,
    borderColor: MyCrewColors.accent,
  },
  modalActionText: {
    marginLeft: Spacing.md,
    fontSize: Typography.body,
    fontWeight: '600',
    color: MyCrewColors.accent,
  },
  modalActionTextPrimary: {
    color: MyCrewColors.white,
  },
  modalScanAgainButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  modalScanAgainText: {
    color: MyCrewColors.textSecondary,
    fontSize: Typography.body,
  },
});