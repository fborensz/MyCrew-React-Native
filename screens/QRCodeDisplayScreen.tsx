// MyCrew React Native - QR Code Display Screen
// Displays QR codes for single contacts, profiles, or multi-contact data

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { MyCrewColors, Typography, Spacing } from '../constants/Colors';
import { RootStackParamList } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'QRCodeDisplay'>;
type RouteProp = RouteProp<RootStackParamList, 'QRCodeDisplay'>;

export default function QRCodeDisplayScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  
  const { 
    qrData, 
    title = 'QR Code', 
    subtitle = 'Scannez avec MyCrew', 
    isMultiContact = false,
    contactCount = 1
  } = route.params || {};

  if (!qrData) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Ionicons 
            name="qr-code-outline" 
            size={80} 
            color={MyCrewColors.iconMuted} 
            style={styles.icon}
          />
          <Text style={styles.title}>Code QR</Text>
          <Text style={styles.subtitle}>
            Aucune donnée QR à afficher
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={MyCrewColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* QR Code Display */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCodeWrapper}>
          <QRCode
            value={qrData}
            size={280}
            backgroundColor="white"
            color="black"
            logoSize={30}
            logoMargin={2}
            logoBorderRadius={15}
            quietZone={10}
          />
        </View>
        
        {/* QR Code Info */}
        <View style={styles.qrInfo}>
          <Text style={styles.qrTitle}>{title}</Text>
          <Text style={styles.qrSubtitle}>{subtitle}</Text>
          
          {isMultiContact && (
            <View style={styles.multiContactBadge}>
              <Ionicons name="people" size={16} color={MyCrewColors.white} />
              <Text style={styles.multiContactText}>
                {contactCount} contact{contactCount > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <View style={styles.instructionItem}>
          <Ionicons name="camera-outline" size={24} color={MyCrewColors.accent} />
          <Text style={styles.instructionText}>
            Ouvrez l'app MyCrew sur un autre téléphone
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <Ionicons name="qr-code-outline" size={24} color={MyCrewColors.accent} />
          <Text style={styles.instructionText}>
            Appuyez sur "Scanner QR Code"
          </Text>
        </View>
        
        <View style={styles.instructionItem}>
          <Ionicons name="scan-outline" size={24} color={MyCrewColors.accent} />
          <Text style={styles.instructionText}>
            Pointez la caméra vers ce QR code
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle-outline" size={24} color={MyCrewColors.accent} />
          <Text style={styles.instructionText}>
            {isMultiContact 
              ? `Les ${contactCount} contacts seront ajoutés automatiquement`
              : 'Le contact sera ajouté automatiquement'
            }
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={() => {
            // TODO: Implement share functionality
            console.log('Share QR code');
          }}
        >
          <Ionicons name="share-outline" size={20} color={MyCrewColors.white} />
          <Text style={styles.shareButtonText}>Partager</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Terminé</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.background,
  },
  headerTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  qrContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  qrCodeWrapper: {
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Spacing.lg,
  },
  qrInfo: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: Typography.title,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  qrSubtitle: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  multiContactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    gap: Spacing.xs,
  },
  multiContactText: {
    fontSize: Typography.caption,
    fontWeight: '600',
    color: MyCrewColors.white,
  },
  instructions: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  instructionText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    marginLeft: Spacing.md,
    flex: 1,
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MyCrewColors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    gap: Spacing.sm,
  },
  shareButtonText: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.white,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  backButtonText: {
    fontSize: Typography.body,
    color: MyCrewColors.accent,
    fontWeight: '500',
  },
  // Legacy styles for fallback
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.title,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  button: {
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: MyCrewColors.background,
    fontSize: Typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});