// MyCrew React Native - QR Code Display Screen
// Version corrigée - affiche réellement les QR codes

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';

import { MyCrewColors, Typography, Spacing } from '../constants/Colors';
import { DatabaseService } from '../services/DatabaseService';
import { QRCodeService } from '../services/QRCodeService';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { Contact, UserProfile, RootStackParamList } from '../types';

type QRCodeDisplayScreenRouteProp = RouteProp<RootStackParamList, 'QRCodeDisplay'>;

export default function QRCodeDisplayScreen() {
  const navigation = useNavigation();
  const route = useRoute<QRCodeDisplayScreenRouteProp>();
  const [contact, setContact] = useState<Contact | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDebug, setShowDebug] = useState(false);

  const { contact: routeContact, profile: routeProfile, qrData } = route.params || {};

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      if (routeContact) {
        setContact(routeContact);
      } else if (routeProfile) {
        setProfile(routeProfile);
      } else if (qrData) {
        // Si on reçoit des données QR brutes, les parser
        const parsedContact = QRCodeService.parseQRData(qrData);
        if (parsedContact) {
          setContact(parsedContact);
        }
      } else {
        // Par défaut, charger le profil utilisateur
        const db = DatabaseService.getInstance();
        const userProfile = await db.getUserProfile();
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Créer un profil par défaut si aucun n'existe
          Alert.alert(
            'Aucun profil',
            'Vous devez d\'abord créer votre profil pour générer un QR code.',
            [
              { text: 'Créer', onPress: () => navigation.navigate('UserProfileEditor' as any) },
              { text: 'Retour', onPress: () => navigation.goBack() }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Erreur initialisation QR Display:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      let shareContent = '';
      let title = '';
      
      if (contact) {
        title = `Contact ${contact.firstName} ${contact.lastName}`;
        shareContent = QRCodeService.generateSimpleContactCard(contact);
      } else if (profile) {
        title = 'Mon profil MyCrew';
        shareContent = QRCodeService.generateSimpleProfileCard(profile);
      }

      await Share.share({
        message: shareContent,
        title: title,
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const handleSaveQR = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Pour l'instant, juste alerter
      // Dans une version complète, on pourrait sauvegarder l'image QR
      Alert.alert(
        'Sauvegarder QR Code',
        'Fonctionnalité de sauvegarde d\'image à venir prochainement. Vous pouvez faire une capture d\'écran en attendant.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!contact && !profile) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="qr-code-outline" size={64} color={MyCrewColors.iconMuted} />
        <Text style={styles.errorTitle}>Aucune donnée</Text>
        <Text style={styles.errorText}>
          Aucun contact ou profil à afficher.
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header avec actions */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDebug(!showDebug)} style={styles.debugButton}>
          <Ionicons 
            name={showDebug ? "bug" : "bug-outline"} 
            size={20} 
            color={showDebug ? MyCrewColors.accent : MyCrewColors.iconMuted} 
          />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={MyCrewColors.accent} />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSaveQR} style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color={MyCrewColors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Display */}
      <View style={styles.qrSection}>
        <QRCodeDisplay 
          contact={contact || undefined}
          profile={profile || undefined}
          size={280}
          showTitle={true}
          showDebugInfo={showDebug}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructionsSection}>
        <Text style={styles.instructionsTitle}>
          Comment utiliser ce QR code
        </Text>
        <Text style={styles.instructionsText}>
          1. Partagez ce QR code avec vos collègues
        </Text>
        <Text style={styles.instructionsText}>
          2. Ils peuvent le scanner avec l'app MyCrew
        </Text>
        <Text style={styles.instructionsText}>
          3. Vos informations seront automatiquement ajoutées à leurs contacts
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        {contact && (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ContactDetail' as any, { contactId: contact.id })}
          >
            <Ionicons name="person" size={20} color={MyCrewColors.white} />
            <Text style={styles.primaryButtonText}>Voir le contact</Text>
          </TouchableOpacity>
        )}
        
        {profile && (
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('UserProfileEditor' as any)}
          >
            <Ionicons name="create" size={20} color={MyCrewColors.white} />
            <Text style={styles.primaryButtonText}>Modifier mon profil</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleShare}
        >
          <Ionicons name="share" size={20} color={MyCrewColors.accent} />
          <Text style={styles.secondaryButtonText}>Partager</Text>
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
  contentContainer: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  debugButton: {
    padding: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    padding: Spacing.md,
    borderRadius: 8,
    backgroundColor: MyCrewColors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  instructionsSection: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.md,
  },
  instructionsText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  actionsSection: {
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: MyCrewColors.white,
    fontSize: Typography.body,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    borderWidth: 1,
    borderColor: MyCrewColors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: MyCrewColors.accent,
    fontSize: Typography.body,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MyCrewColors.background,
    padding: Spacing.xl,
  },
  loadingText: {
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
  },
  buttonText: {
    color: MyCrewColors.white,
    fontSize: Typography.body,
    fontWeight: '600',
  },
});