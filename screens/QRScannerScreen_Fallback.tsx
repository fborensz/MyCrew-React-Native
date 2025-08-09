// MyCrew QR Scanner Screen - Fallback avec saisie manuelle
// Cette version fournit une alternative si expo-camera ne fonctionne pas

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { MyCrewColors, Spacing, Typography, BorderRadius } from '../constants/Colors';
import { QRCodeService } from '../services/QRCodeService';
import type { Contact, StackNavigationProp, RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'QRScanner'>;

export default function QRScannerScreenFallback() {
  const navigation = useNavigation<NavigationProp>();
  const [qrText, setQrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset form when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setQrText('');
      setIsProcessing(false);
    }, [])
  );

  const handleManualQRInput = async () => {
    if (!qrText.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un code QR');
      return;
    }

    setIsProcessing(true);

    try {
      const contactData = QRCodeService.parseQRData(qrText.trim());
      
      if (contactData) {
        const previewInfo = QRCodeService.getQRPreviewInfo(qrText.trim());
        const displayName = previewInfo?.name || `${contactData.firstName} ${contactData.lastName}`.trim();
        const displayJob = previewInfo?.jobTitle || contactData.jobTitle || '';
        
        Alert.alert(
          'Contact détecté !',
          `${displayName}${displayJob ? `\n${displayJob}` : ''}`,
          [
            {
              text: 'Ignorer',
              style: 'cancel',
              onPress: () => {
                setIsProcessing(false);
                setQrText('');
              },
            },
            {
              text: 'Ajouter',
              onPress: () => {
                setIsProcessing(false);
                navigation.navigate('AddContact', { contactData });
              },
            },
          ]
        );
      } else {
        const isMyCrew = QRCodeService.isMyCyewQRCode(qrText.trim());
        
        Alert.alert(
          isMyCrew ? 'QR Code MyCrew invalide' : 'QR Code non supporté',
          isMyCrew 
            ? 'Ce QR code MyCrew semble corrompu ou d\'une version non compatible.'
            : 'Ce QR code ne contient pas de données de contact MyCrew.',
          [
            {
              text: 'Réessayer',
              onPress: () => {
                setIsProcessing(false);
                setQrText('');
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors du parsing du QR code:', error);
      Alert.alert(
        'Erreur de lecture',
        'Le texte saisi ne semble pas être un QR code valide.',
        [
          {
            text: 'OK',
            onPress: () => setIsProcessing(false),
          },
        ]
      );
    }
  };

  const showHelp = () => {
    Alert.alert(
      'Comment utiliser cette fonction',
      'Pour importer un contact via QR code :\n\n1. Demandez à votre contact de vous montrer son QR code MyCrew\n2. Copiez le texte du QR code\n3. Collez-le dans le champ ci-dessous\n4. Appuyez sur "Analyser le code"',
      [{ text: 'Compris' }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={MyCrewColors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={MyCrewColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner QR Code</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={showHelp}
        >
          <Ionicons name="help-circle-outline" size={24} color={MyCrewColors.iconMuted} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Info card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={32} color={MyCrewColors.accent} />
            <Text style={styles.infoTitle}>Scanner QR Code</Text>
            <Text style={styles.infoDescription}>
              La caméra n'est pas disponible. Vous pouvez néanmoins importer un contact 
              en collant le texte d'un QR code MyCrew ci-dessous.
            </Text>
          </View>

          {/* QR Input section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Code QR MyCrew</Text>
            <TextInput
              style={styles.textInput}
              value={qrText}
              onChangeText={setQrText}
              placeholder="Collez ici le texte du QR code..."
              placeholderTextColor={MyCrewColors.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            
            <TouchableOpacity
              style={[styles.analyzeButton, isProcessing && styles.analyzeButtonDisabled]}
              onPress={handleManualQRInput}
              disabled={isProcessing}
            >
              <Ionicons 
                name={isProcessing ? "hourglass-outline" : "search"} 
                size={20} 
                color="white" 
                style={styles.buttonIcon}
              />
              <Text style={styles.analyzeButtonText}>
                {isProcessing ? 'Analyse...' : 'Analyser le code'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Alternative actions */}
          <View style={styles.alternativeSection}>
            <Text style={styles.alternativeTitle}>Ou</Text>
            
            <TouchableOpacity
              style={styles.manualButton}
              onPress={() => navigation.navigate('AddContact')}
            >
              <Ionicons name="create-outline" size={20} color={MyCrewColors.accent} />
              <Text style={styles.manualButtonText}>Ajouter un contact manuellement</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: MyCrewColors.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: MyCrewColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: MyCrewColors.textPrimary,
    fontSize: Typography.headline,
    fontWeight: '600',
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: MyCrewColors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  
  infoCard: {
    backgroundColor: MyCrewColors.cardBackground,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...MyCrewColors.cardShadow && {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  infoTitle: {
    color: MyCrewColors.textPrimary,
    fontSize: Typography.title,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoDescription: {
    color: MyCrewColors.textSecondary,
    fontSize: Typography.body,
    textAlign: 'center',
    lineHeight: 24,
  },
  
  inputSection: {
    backgroundColor: MyCrewColors.cardBackground,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    color: MyCrewColors.textPrimary,
    fontSize: Typography.body,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: MyCrewColors.lightGray,
    borderColor: MyCrewColors.border,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.lg,
    minHeight: 120,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: MyCrewColors.white,
    fontSize: Typography.body,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  
  alternativeSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  alternativeTitle: {
    color: MyCrewColors.textSecondary,
    fontSize: Typography.body,
    marginBottom: Spacing.lg,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: MyCrewColors.accent,
  },
  manualButtonText: {
    color: MyCrewColors.accent,
    fontSize: Typography.body,
    fontWeight: '500',
    marginLeft: Spacing.sm,
  },
});