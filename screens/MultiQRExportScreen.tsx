// MyCrew React Native - Multi-Contact QR Export Screen
// Allows selecting up to 10 contacts for QR code export

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { MyCrewColors, Typography, Spacing } from '../constants/Colors';
import { QRCodeService } from '../services/QRCodeService';
import { DatabaseService } from '../services/DatabaseService';
import { FilterService } from '../services/FilterService';
import { Contact, RootStackParamList, getContactFullName } from '../types';

type NavigationProp = StackNavigationProp<RootStackParamList, 'MultiQRExport'>;
type RouteProps = RouteProp<RootStackParamList, 'MultiQRExport'>;

export default function MultiQRExportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { filters, searchText = '' } = route.params || {};
  
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const db = DatabaseService.getInstance();
      const allContactsData = await db.getAllContacts();
      setAllContacts(allContactsData);
      
      // Appliquer les filtres si fournis
      if (filters) {
        const filteredContacts = FilterService.applyAllFilters(allContactsData, filters, searchText);
        setContacts(filteredContacts);
        console.log(`🔍 Filtres appliqués: ${filteredContacts.length}/${allContactsData.length} contacts`);
      } else {
        setContacts(allContactsData);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        if (newSet.size >= 10) {
          Alert.alert(
            'Limite atteinte',
            'Maximum 10 contacts peuvent être exportés dans un seul QR code.'
          );
          return prev;
        }
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const limit = Math.min(contacts.length, 10);
    const newSet = new Set(contacts.slice(0, limit).map(c => c.id));
    setSelectedContacts(newSet);
    
    if (contacts.length > 10) {
      Alert.alert(
        'Sélection limitée',
        `Seuls les 10 premiers contacts ont été sélectionnés (limite QR code).`
      );
    }
  };

  const clearSelection = () => {
    setSelectedContacts(new Set());
  };

  const generateQRCode = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Aucun contact sélectionné', 'Veuillez sélectionner au moins un contact.');
      return;
    }

    setIsGenerating(true);

    try {
      const selectedContactsList = contacts.filter(c => selectedContacts.has(c.id));
      const result = QRCodeService.generateMultiContactQRData(selectedContactsList);

      if (result.success) {
        console.log(`✅ QR code généré pour ${result.count} contacts`);
        
        // Navigate to QR display screen
        navigation.navigate('QRCodeDisplay', {
          qrData: result.data!,
          title: `${result.count} Contacts`,
          subtitle: selectedContactsList.length === 1 
            ? getContactFullName(selectedContactsList[0])
            : `${getContactFullName(selectedContactsList[0])} et ${result.count - 1} autres`,
          isMultiContact: true,
          contactCount: result.count
        });
      } else {
        Alert.alert(
          'Erreur de génération',
          result.error || 'Impossible de générer le QR code avec ces contacts.'
        );
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la génération du QR code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContactItem = (contact: Contact) => {
    const isSelected = selectedContacts.has(contact.id);
    const primaryLocation = contact.locations.find(loc => loc.isPrimary);
    const city = primaryLocation?.region || primaryLocation?.country || '';

    return (
      <TouchableOpacity
        key={contact.id}
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => toggleContactSelection(contact.id)}
      >
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, isSelected && styles.selectedText]}>
            {getContactFullName(contact)}
          </Text>
          <Text style={[styles.contactDetails, isSelected && styles.selectedSecondaryText]}>
            {contact.jobTitle}
          </Text>
          {city && (
            <Text style={[styles.contactDetails, isSelected && styles.selectedSecondaryText]}>
              📍 {city}
            </Text>
          )}
        </View>
        <Switch
          value={isSelected}
          onValueChange={() => toggleContactSelection(contact.id)}
          trackColor={{ false: MyCrewColors.border, true: MyCrewColors.accent }}
          thumbColor={isSelected ? MyCrewColors.white : MyCrewColors.textSecondary}
        />
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={MyCrewColors.accent} />
        <Text style={styles.loadingText}>Chargement des contacts...</Text>
      </View>
    );
  }

  if (contacts.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="people-outline" size={80} color={MyCrewColors.iconMuted} />
        <Text style={styles.emptyTitle}>Aucun contact</Text>
        <Text style={styles.emptyText}>
          Ajoutez des contacts pour pouvoir les exporter en QR code.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={MyCrewColors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export QR Multi-Contacts</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters info */}
      {filters && FilterService.hasActiveFilters(filters) && (
        <View style={styles.filtersInfo}>
          <View style={styles.filtersHeader}>
            <Ionicons name="filter" size={16} color={MyCrewColors.accent} />
            <Text style={styles.filtersText}>
              Filtres appliqués - {contacts.length} contact{contacts.length > 1 ? 's' : ''} affiché{contacts.length > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.filtersDetails}>
            {filters.job && <Text style={styles.filterTag}>{filters.job}</Text>}
            {filters.country && <Text style={styles.filterTag}>{filters.country}</Text>}
            {filters.regions.map(region => (
              <Text key={region} style={styles.filterTag}>{region}</Text>
            ))}
            {filters.isLocalResident && <Text style={styles.filterTag}>Résidence fiscale</Text>}
            {filters.hasVehicle && <Text style={styles.filterTag}>Véhicule</Text>}
            {filters.isHoused && <Text style={styles.filterTag}>Logé</Text>}
          </View>
        </View>
      )}

      {/* Selection controls */}
      <View style={styles.controls}>
        <Text style={styles.selectionInfo}>
          {selectedContacts.size}/10 contacts sélectionnés
        </Text>
        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton} onPress={selectAll}>
            <Text style={styles.controlButtonText}>Tout sélectionner</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={clearSelection}>
            <Text style={styles.controlButtonText}>Tout désélectionner</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contacts list */}
      <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
        {contacts.map(renderContactItem)}
      </ScrollView>

      {/* Generate button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generateButton,
            selectedContacts.size === 0 && styles.generateButtonDisabled,
            isGenerating && styles.generateButtonGenerating
          ]}
          onPress={generateQRCode}
          disabled={selectedContacts.size === 0 || isGenerating}
        >
          {isGenerating ? (
            <>
              <ActivityIndicator size="small" color={MyCrewColors.white} style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>Génération...</Text>
            </>
          ) : (
            <>
              <Ionicons name="qr-code" size={20} color={MyCrewColors.white} style={{ marginRight: 8 }} />
              <Text style={styles.generateButtonText}>
                Générer QR ({selectedContacts.size})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: MyCrewColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.background,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  headerTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  controls: {
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  selectionInfo: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.xs,
    backgroundColor: MyCrewColors.border,
    borderRadius: 6,
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: Typography.caption,
    color: MyCrewColors.textSecondary,
    fontWeight: '500',
  },
  contactsList: {
    flex: 1,
    padding: Spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: MyCrewColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  contactItemSelected: {
    backgroundColor: MyCrewColors.accentLight,
    borderColor: MyCrewColors.accent,
  },
  contactInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  contactName: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: 2,
  },
  contactDetails: {
    fontSize: Typography.caption,
    color: MyCrewColors.textSecondary,
    marginBottom: 1,
  },
  selectedText: {
    color: MyCrewColors.accent,
  },
  selectedSecondaryText: {
    color: MyCrewColors.accent,
    opacity: 0.8,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: MyCrewColors.surface,
    borderTopWidth: 1,
    borderTopColor: MyCrewColors.border,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MyCrewColors.accent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  generateButtonDisabled: {
    backgroundColor: MyCrewColors.iconMuted,
  },
  generateButtonGenerating: {
    backgroundColor: MyCrewColors.accent,
    opacity: 0.8,
  },
  generateButtonText: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.white,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
  },
  emptyTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  filtersInfo: {
    backgroundColor: MyCrewColors.accentLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  filtersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  filtersText: {
    fontSize: Typography.caption,
    color: MyCrewColors.accent,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  filtersDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  filterTag: {
    fontSize: Typography.caption,
    color: MyCrewColors.accent,
    backgroundColor: MyCrewColors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MyCrewColors.accent,
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