// MyCrew React Native - Profile Screen
// Affichage et gestion du profil utilisateur

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { MyCrewColors } from '../constants/Colors';
import { UserProfile, getUserProfileFullName } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import ExportModal from '../components/ExportModal';
import QRCodePopup from '../components/QRCodePopup';

const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const Typography = {
  small: 12,
  body: 14,
  subheadline: 16,
  headline: 18,
  title: 20,
  largeTitle: 24,
};

const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);

  // Recharger le profil à chaque fois que l'écran devient actif
  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const db = DatabaseService.getInstance();
      const userProfile = await db.getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      Alert.alert('Erreur', 'Impossible de charger votre profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const navigateToEditor = () => {
    navigation.navigate('UserProfileEditor' as never);
  };

  const navigateToQRCode = () => {
    if (profile) {
      navigation.navigate('QRCodeDisplay' as never, { profile } as never);
    } else {
      Alert.alert('Aucun profil', 'Créez d\'abord votre profil pour générer un QR code.');
    }
  };

  const handleExport = () => {
    if (profile) {
      setShowExportModal(true);
    } else {
      Alert.alert('Aucun profil', 'Créez d\'abord votre profil pour l\'exporter.');
    }
  };

  const getPrimaryLocation = () => {
    if (!profile?.locations) return null;
    return profile.locations.find(loc => loc.isPrimary) || profile.locations[0];
  };

  const getSecondaryLocations = () => {
    if (!profile?.locations) return [];
    return profile.locations.filter(loc => !loc.isPrimary);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.emptyState}>
          <Ionicons 
            name="person-outline" 
            size={80} 
            color={MyCrewColors.iconMuted} 
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>Aucun profil configuré</Text>
          <Text style={styles.emptySubtitle}>
            Créez votre profil professionnel pour partager vos informations de contact avec l'équipe.
          </Text>
          
          <TouchableOpacity style={styles.createButton} onPress={navigateToEditor}>
            <Ionicons name="add" size={20} color={MyCrewColors.background} />
            <Text style={styles.createButtonText}>Créer mon profil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const primaryLocation = getPrimaryLocation();
  const secondaryLocations = getSecondaryLocations();

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header du profil */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => setShowQRPopup(true)} style={styles.qrButton}>
          <Ionicons name="qr-code-outline" size={42} color={MyCrewColors.background} />
        </TouchableOpacity>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{getUserProfileFullName(profile)}</Text>
          <Text style={styles.profileJob}>{profile.jobTitle}</Text>
          {primaryLocation && (
            <Text style={styles.profileLocation}>
              {primaryLocation.region || primaryLocation.country}
            </Text>
          )}
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
            <Ionicons name="share-outline" size={20} color={MyCrewColors.background} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={navigateToEditor}>
            <Ionicons name="create-outline" size={20} color={MyCrewColors.background} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Informations de contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={20} color={MyCrewColors.iconMuted} />
          <Text style={styles.contactText}>{profile.phoneNumber}</Text>
        </View>
        
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={20} color={MyCrewColors.iconMuted} />
          <Text style={styles.contactText}>{profile.email}</Text>
        </View>
      </View>

      {/* Localisation(s) */}
      {primaryLocation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {secondaryLocations.length === 0 ? 'Lieu de travail' : 'Lieu de travail principal'}
          </Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={18} color={MyCrewColors.accent} />
              <Text style={styles.locationName}>
                {primaryLocation.region ? 
                  `${primaryLocation.region}, ${primaryLocation.country}` : 
                  primaryLocation.country
                }
              </Text>
            </View>
            
            <View style={styles.locationDetails}>
              {primaryLocation.isLocalResident && (
                <View style={styles.locationBadge}>
                  <Ionicons name="home" size={14} color={MyCrewColors.accent} />
                  <Text style={styles.locationBadgeText}>Résident fiscal</Text>
                </View>
              )}
              {primaryLocation.hasVehicle && (
                <View style={styles.locationBadge}>
                  <Ionicons name="car" size={14} color={MyCrewColors.accent} />
                  <Text style={styles.locationBadgeText}>Véhicule</Text>
                </View>
              )}
              {primaryLocation.isHoused && (
                <View style={styles.locationBadge}>
                  <Ionicons name="bed" size={14} color={MyCrewColors.accent} />
                  <Text style={styles.locationBadgeText}>Logé sur place</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Autres localisations */}
      {secondaryLocations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {secondaryLocations.length === 1 ? 'Lieu de travail 2' : 'Autres lieux de travail'}
          </Text>
          {secondaryLocations.map((location, index) => (
            <View key={index} style={styles.locationCard}>
              {secondaryLocations.length > 1 && (
                <Text style={styles.locationNumber}>Lieu {index + 2}</Text>
              )}
              <View style={styles.locationHeader}>
                <Ionicons name="location-outline" size={18} color={MyCrewColors.textSecondary} />
                <Text style={styles.locationName}>
                  {location.region ? 
                    `${location.region}, ${location.country}` : 
                    location.country
                  }
                </Text>
              </View>
              
              <View style={styles.locationDetails}>
                {location.isLocalResident && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="home" size={14} color={MyCrewColors.textSecondary} />
                    <Text style={styles.locationBadgeText}>Résident fiscal</Text>
                  </View>
                )}
                {location.hasVehicle && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="car" size={14} color={MyCrewColors.textSecondary} />
                    <Text style={styles.locationBadgeText}>Véhicule</Text>
                  </View>
                )}
                {location.isHoused && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="bed" size={14} color={MyCrewColors.textSecondary} />
                    <Text style={styles.locationBadgeText}>Logé sur place</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      
      {/* Export Modal */}
      <ExportModal 
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={profile}
        type="profile"
      />
      
      {/* QR Code Popup */}
      {profile && (
        <QRCodePopup
          visible={showQRPopup}
          onClose={() => setShowQRPopup(false)}
          data={JSON.stringify({
            firstName: profile.firstName,
            lastName: profile.lastName,
            jobTitle: profile.jobTitle,
            phoneNumber: profile.phoneNumber,
            email: profile.email,
            locations: profile.locations
          })}
          title={getUserProfileFullName(profile)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.title,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  createButton: {
    backgroundColor: MyCrewColors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  createButtonText: {
    color: MyCrewColors.background,
    fontSize: Typography.subheadline,
    fontWeight: '600',
  },
  profileHeader: {
    backgroundColor: MyCrewColors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  qrButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.title,
    fontWeight: '700',
    color: MyCrewColors.background,
    marginBottom: Spacing.xs,
  },
  profileJob: {
    fontSize: Typography.subheadline,
    color: MyCrewColors.background,
    marginBottom: Spacing.xs,
    opacity: 0.9,
  },
  profileLocation: {
    fontSize: Typography.body,
    color: MyCrewColors.background,
    opacity: 0.8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  section: {
    backgroundColor: MyCrewColors.cardBackground,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    ...Shadows.small,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    flex: 1,
  },
  locationCard: {
    backgroundColor: MyCrewColors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  locationName: {
    fontSize: Typography.subheadline,
    fontWeight: '500',
    color: MyCrewColors.textPrimary,
    flex: 1,
  },
  locationNumber: {
    fontSize: Typography.small,
    color: MyCrewColors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  locationBadgeText: {
    fontSize: Typography.small,
    color: MyCrewColors.accent,
    fontWeight: '500',
  },
});