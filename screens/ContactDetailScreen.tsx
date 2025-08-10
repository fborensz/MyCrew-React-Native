// MyCrew React Native - Contact Detail Screen
// Displays detailed contact information

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import QRCodePopup from '../components/QRCodePopup';
import JobBadges from '../components/JobBadges';
import { DatabaseService } from '../services/DatabaseService';
import { MyCrewColors, Spacing, BorderRadius, Shadows } from '../constants/Colors';
import { Contact, RootStackParamList, getContactFullName } from '../types';
import ExportModal from '../components/ExportModal';

interface ContactDetailScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'ContactDetail'>;
  route: RouteProp<RootStackParamList, 'ContactDetail'>;
}

export default function ContactDetailScreen({ navigation, route }: ContactDetailScreenProps) {
  const { contactId } = route.params;
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);

  useEffect(() => {
    loadContact();
  }, [contactId]);
  
  // Recharger le contact quand l'écran reprend le focus (après édition)
  useFocusEffect(
    React.useCallback(() => {
      loadContact();
    }, [contactId])
  );

  // Configurer les boutons header - TOUJOURS appelé (même en loading/error)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation, contact]);

  const loadContact = async () => {
    try {
      const db = DatabaseService.getInstance();
      const contactData = await db.getContact(contactId);
      setContact(contactData);
    } catch (error) {
      console.error('Error loading contact:', error);
      Alert.alert('Erreur', 'Impossible de charger le contact');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditContact', { contactId });
  };

  const handleExport = () => {
    if (contact) {
      setShowExportModal(true);
    }
  };
  
  const handleQRCode = () => {
    if (contact) {
      navigation.navigate('QRCodeDisplay', { contact });
    }
  };

  const handleCall = async (phoneNumber: string) => {
    try {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application téléphone');
      }
    } catch (error) {
      console.error('Error opening phone app:', error);
    }
  };

  const handleEmail = async (email: string) => {
    try {
      const url = `mailto:${email}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application email');
      }
    } catch (error) {
      console.error('Error opening email app:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!contact) return;
    
    try {
      const db = DatabaseService.getInstance();
      const updatedContact = { ...contact, isFavorite: !contact.isFavorite };
      await db.updateContact(contact.id, updatedContact);
      setContact(updatedContact);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Erreur', 'Impossible de modifier le favori');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le contact',
      'Êtes-vous sûr de vouloir supprimer ce contact?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: deleteContact,
        },
      ]
    );
  };

  const deleteContact = async () => {
    try {
      const db = DatabaseService.getInstance();
      await db.deleteContact(contactId);
      navigation.goBack();
    } catch (error) {
      console.error('Error deleting contact:', error);
      Alert.alert('Erreur', 'Impossible de supprimer le contact');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ThemedText>Chargement...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!contact) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ThemedText>Contact non trouvé</ThemedText>
        </View>
      </ThemedView>
    );
  }


  const primaryLocation = contact.locations.find(loc => loc.isPrimary);
  const secondaryLocations = contact.locations.filter(loc => !loc.isPrimary);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={() => setShowQRPopup(true)} style={styles.qrButton}>
              <Ionicons name="qr-code-outline" size={42} color={MyCrewColors.accent} />
            </TouchableOpacity>
            
            <View style={styles.nameSection}>
              <View style={styles.nameRow}>
                <ThemedText variant="title" weight="bold">
                  {getContactFullName(contact)}
                </ThemedText>
                <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteStarButton}>
                  <Ionicons 
                    name={contact.isFavorite ? "star" : "star-outline"} 
                    size={16} 
                    color={contact.isFavorite ? MyCrewColors.favoriteStar : MyCrewColors.iconMuted} 
                  />
                </TouchableOpacity>
              </View>
              <JobBadges 
                jobTitles={contact.jobTitles || (contact.jobTitle ? [contact.jobTitle] : [])} 
                style={styles.jobBadges}
              />
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={handleExport} style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color={MyCrewColors.accent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                <Ionicons name="create-outline" size={20} color={MyCrewColors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <ThemedText variant="headline" weight="semibold" style={styles.sectionTitle}>
            Contact
          </ThemedText>
          
          {contact.phone && (
            <TouchableOpacity 
              style={styles.infoRow} 
              onPress={() => handleCall(contact.phone)}
            >
              <Ionicons name="call-outline" size={20} color={MyCrewColors.iconMuted} />
              <ThemedText variant="body" style={styles.infoText}>
                {contact.phone}
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {contact.email && (
            <TouchableOpacity 
              style={styles.infoRow} 
              onPress={() => handleEmail(contact.email)}
            >
              <Ionicons name="mail-outline" size={20} color={MyCrewColors.iconMuted} />
              <ThemedText variant="body" style={styles.infoText}>
                {contact.email}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Localisation(s) */}
        {primaryLocation && (
          <View style={styles.section}>
            <ThemedText variant="headline" weight="semibold" style={styles.sectionTitle}>
              {secondaryLocations.length === 0 ? 'Lieu de travail' : 'Lieu de travail principal'}
            </ThemedText>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={18} color={MyCrewColors.accent} />
                <ThemedText variant="body" weight="semibold" style={styles.locationName}>
                  {primaryLocation.region ? 
                    `${primaryLocation.region}, ${primaryLocation.country}` : 
                    primaryLocation.country
                  }
                </ThemedText>
              </View>
              
              <View style={styles.locationDetails}>
                {primaryLocation.isLocalResident && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="home" size={14} color={MyCrewColors.accent} />
                    <ThemedText variant="caption" color="accent" weight="medium">Résident fiscal</ThemedText>
                  </View>
                )}
                {primaryLocation.hasVehicle && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="car" size={14} color={MyCrewColors.accent} />
                    <ThemedText variant="caption" color="accent" weight="medium">Véhicule</ThemedText>
                  </View>
                )}
                {primaryLocation.isHoused && (
                  <View style={styles.locationBadge}>
                    <Ionicons name="bed" size={14} color={MyCrewColors.accent} />
                    <ThemedText variant="caption" color="accent" weight="medium">Logé sur place</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Autres localisations */}
        {secondaryLocations.length > 0 && (
          <View style={styles.section}>
            <ThemedText variant="headline" weight="semibold" style={styles.sectionTitle}>
              {secondaryLocations.length === 1 ? 'Lieu de travail 2' : 'Autres lieux de travail'}
            </ThemedText>
            {secondaryLocations.map((location, index) => (
              <View key={location.id} style={styles.locationCard}>
                {secondaryLocations.length > 1 && (
                  <ThemedText variant="caption" color="textSecondary" style={styles.locationNumber}>
                    Lieu {index + 2}
                  </ThemedText>
                )}
                <View style={styles.locationHeader}>
                  <Ionicons name="location-outline" size={18} color={MyCrewColors.textSecondary} />
                  <ThemedText variant="body" style={styles.locationName}>
                    {location.region ? 
                      `${location.region}, ${location.country}` : 
                      location.country
                    }
                  </ThemedText>
                </View>
                
                <View style={styles.locationDetails}>
                  {location.isLocalResident && (
                    <View style={styles.locationBadge}>
                      <Ionicons name="home" size={14} color={MyCrewColors.textSecondary} />
                      <ThemedText variant="caption" color="textSecondary" weight="medium">Résident fiscal</ThemedText>
                    </View>
                  )}
                  {location.hasVehicle && (
                    <View style={styles.locationBadge}>
                      <Ionicons name="car" size={14} color={MyCrewColors.textSecondary} />
                      <ThemedText variant="caption" color="textSecondary" weight="medium">Véhicule</ThemedText>
                    </View>
                  )}
                  {location.isHoused && (
                    <View style={styles.locationBadge}>
                      <Ionicons name="bed" size={14} color={MyCrewColors.textSecondary} />
                      <ThemedText variant="caption" color="textSecondary" weight="medium">Logé sur place</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {contact.notes && (
          <View style={styles.section}>
            <ThemedText variant="headline" weight="semibold" style={styles.sectionTitle}>
              Notes
            </ThemedText>
            <ThemedText variant="body" style={styles.notes}>
              {contact.notes}
            </ThemedText>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={MyCrewColors.destructive} />
          <ThemedText variant="body" color="destructive" style={styles.deleteText}>
            Supprimer le contact
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Export Modal */}
      <ExportModal 
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        data={contact}
        type="contact"
      />
      
      {/* QR Code Popup */}
      {contact && (
        <QRCodePopup
          visible={showQRPopup}
          onClose={() => setShowQRPopup(false)}
          data={JSON.stringify({
            firstName: contact.firstName,
            lastName: contact.lastName,
            jobTitles: contact.jobTitles || (contact.jobTitle ? [contact.jobTitle] : []),
            phone: contact.phone,
            email: contact.email,
            locations: contact.locations
          })}
          title={getContactFullName(contact)}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: Spacing.md,
    backgroundColor: MyCrewColors.cardBackground,
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qrButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: MyCrewColors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  nameSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  favoriteStarButton: {
    marginLeft: 4,
    padding: 2,
  },
  jobBadges: {
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  section: {
    padding: Spacing.sm,
    backgroundColor: MyCrewColors.cardBackground,
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoText: {
    marginLeft: Spacing.sm,
  },
  locationCard: {
    backgroundColor: MyCrewColors.background,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  locationName: {
    flex: 1,
  },
  locationNumber: {
    marginBottom: 4,
    fontWeight: '600',
  },
  locationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.accentLight,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  notes: {
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.lg,
    alignSelf: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MyCrewColors.destructive,
  },
  deleteText: {
    marginLeft: Spacing.sm,
  },
});