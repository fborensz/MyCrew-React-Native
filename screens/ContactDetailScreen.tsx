// MyCrew React Native - Contact Detail Screen
// Displays detailed contact information

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { DatabaseService } from '../services/DatabaseService';
import { MyCrewColors, Spacing } from '../constants/Colors';
import { Contact, RootStackParamList } from '../types';

interface ContactDetailScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'ContactDetail'>;
  route: RouteProp<RootStackParamList, 'ContactDetail'>;
}

export default function ContactDetailScreen({ navigation, route }: ContactDetailScreenProps) {
  const { contactId } = route.params;
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadContact();
  }, [contactId]);

  // Configurer les boutons header - TOUJOURS appelé (même en loading/error)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={handleEdit} 
            style={[styles.headerButton, !contact && styles.headerButtonDisabled]}
            disabled={!contact}
          >
            <Ionicons name="create-outline" size={24} color={!contact ? MyCrewColors.iconMuted : MyCrewColors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleQRCode} 
            style={[styles.headerButton, !contact && styles.headerButtonDisabled]}
            disabled={!contact}
          >
            <Ionicons name="qr-code-outline" size={24} color={!contact ? MyCrewColors.iconMuted : MyCrewColors.textPrimary} />
          </TouchableOpacity>
        </View>
      ),
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
          <View style={styles.nameSection}>
            <ThemedText variant="title" weight="bold">
              {contact.name}
            </ThemedText>
            {contact.isFavorite && (
              <Ionicons 
                name="star" 
                size={24} 
                color={MyCrewColors.favoriteStar} 
                style={styles.favoriteIcon}
              />
            )}
          </View>
          <ThemedText variant="headline" color="textSecondary">
            {contact.jobTitle}
          </ThemedText>
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

        {/* Locations */}
        {(primaryLocation || secondaryLocations.length > 0) && (
          <View style={styles.section}>
            <ThemedText variant="headline" weight="semibold" style={styles.sectionTitle}>
              Lieux de travail
            </ThemedText>
            
            {primaryLocation && (
              <View style={styles.locationRow}>
                <Ionicons name="location" size={20} color={MyCrewColors.accent} />
                <View style={styles.locationInfo}>
                  <ThemedText variant="body" weight="semibold">
                    {primaryLocation.region || primaryLocation.country}
                  </ThemedText>
                  <View style={styles.locationAttributes}>
                    {primaryLocation.isLocalResident && (
                      <View style={styles.attribute}>
                        <ThemedText variant="caption" color="accent">Résident</ThemedText>
                      </View>
                    )}
                    {primaryLocation.hasVehicle && (
                      <View style={styles.attribute}>
                        <ThemedText variant="caption" color="accent">Véhicule</ThemedText>
                      </View>
                    )}
                    {primaryLocation.isHoused && (
                      <View style={styles.attribute}>
                        <ThemedText variant="caption" color="accent">Logé</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {secondaryLocations.map((location, index) => (
              <View key={location.id} style={styles.locationRow}>
                <Ionicons name="location-outline" size={20} color={MyCrewColors.iconMuted} />
                <View style={styles.locationInfo}>
                  <ThemedText variant="body">
                    {location.region || location.country}
                  </ThemedText>
                  <View style={styles.locationAttributes}>
                    {location.isLocalResident && (
                      <View style={styles.attribute}>
                        <ThemedText variant="caption" color="textSecondary">Résident</ThemedText>
                      </View>
                    )}
                    {location.hasVehicle && (
                      <View style={styles.attribute}>
                        <ThemedText variant="caption" color="textSecondary">Véhicule</ThemedText>
                      </View>
                    )}
                    {location.isHoused && (
                      <View style={styles.attribute}>
                        <ThemedText variant="caption" color="textSecondary">Logé</ThemedText>
                      </View>
                    )}
                  </View>
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
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: Spacing.md,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.separator,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  favoriteIcon: {
    marginLeft: Spacing.sm,
  },
  section: {
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.cardBackground,
    marginTop: Spacing.sm,
    marginHorizontal: Spacing.md,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoText: {
    marginLeft: Spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  locationInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  locationAttributes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  attribute: {
    backgroundColor: MyCrewColors.lightGray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  notes: {
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    margin: Spacing.lg,
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MyCrewColors.destructive,
  },
  deleteText: {
    marginLeft: Spacing.sm,
  },
});