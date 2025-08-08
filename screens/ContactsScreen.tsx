// MyCrew React Native - Contacts Screen
// Main screen displaying contacts list with search and filtering

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';

import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { DatabaseService } from '../services/DatabaseService';
import { MyCrewColors, Spacing } from '../constants/Colors';
import { Contact, RootStackParamList } from '../types';

interface ContactRowProps {
  contact: Contact;
  onPress: () => void;
  onQRPress: () => void;
}

function ContactRow({ contact, onPress, onQRPress }: ContactRowProps) {
  const primaryLocation = contact.locations.find(loc => loc.isPrimary);
  const city = primaryLocation?.region || primaryLocation?.country || '';

  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress}>
      <View style={styles.contactInfo}>
        <View style={styles.nameRow}>
          <ThemedText variant="body" weight="semibold" numberOfLines={1}>
            {contact.name}
          </ThemedText>
          {contact.isFavorite && (
            <Ionicons 
              name="star" 
              size={16} 
              color={MyCrewColors.favoriteStar} 
              style={styles.favoriteIcon}
            />
          )}
        </View>
        <ThemedText variant="footnote" color="textSecondary" numberOfLines={1}>
          {contact.jobTitle}
        </ThemedText>
        {city && (
          <ThemedText variant="caption" color="iconMuted" numberOfLines={1}>
            {city}
          </ThemedText>
        )}
      </View>
      <TouchableOpacity style={styles.qrButton} onPress={onQRPress}>
        <Ionicons name="qr-code-outline" size={24} color={MyCrewColors.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

interface ContactsScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'MainTabs'>;
}

export default function ContactsScreen({ navigation }: ContactsScreenProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContacts = async () => {
    try {
      const db = DatabaseService.getInstance();
      const contactsData = await db.getAllContacts();
      setContacts(contactsData);
      setFilteredContacts(contactsData);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const searchContacts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    try {
      const db = DatabaseService.getInstance();
      const results = await db.searchContacts(query);
      setFilteredContacts(results);
    } catch (error) {
      console.error('Error searching contacts:', error);
    }
  }, [contacts]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    searchContacts(text);
  };

  const handleContactPress = (contact: Contact) => {
    navigation.navigate('ContactDetail', { contactId: contact.id });
  };

  const handleQRPress = (contact: Contact) => {
    navigation.navigate('QRCodeDisplay', { contact });
  };

  const handleAddContact = () => {
    navigation.navigate('AddContact');
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadContacts();
  };

  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [])
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="people-outline" 
        size={64} 
        color={MyCrewColors.iconMuted} 
        style={styles.emptyIcon}
      />
      <ThemedText variant="headline" weight="semibold" style={styles.emptyTitle}>
        Aucun contact
      </ThemedText>
      <ThemedText variant="body" color="textSecondary" style={styles.emptyText}>
        Ajoutez votre premier contact pour commencer à constituer votre équipe
      </ThemedText>
      <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
        <ThemedText variant="body" weight="semibold" color="white">
          Ajouter un contact
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderContact = ({ item }: { item: Contact }) => (
    <ContactRow
      contact={item}
      onPress={() => handleContactPress(item)}
      onQRPress={() => handleQRPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color={MyCrewColors.iconMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={MyCrewColors.gray}
          value={searchText}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={MyCrewColors.gray} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
          <Ionicons name="qr-code" size={24} color={MyCrewColors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButtonHeader} onPress={handleAddContact}>
          <Ionicons name="add" size={24} color={MyCrewColors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          filteredContacts.length === 0 && styles.emptyList
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[MyCrewColors.accent]}
            tintColor={MyCrewColors.accent}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.separator,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.lightGray,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: MyCrewColors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  scanButton: {
    flex: 1,
    backgroundColor: MyCrewColors.iconMuted,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonHeader: {
    flex: 1,
    backgroundColor: MyCrewColors.accent,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 12,
    elevation: 1,
    shadowColor: MyCrewColors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  favoriteIcon: {
    marginLeft: Spacing.xs,
  },
  qrButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  addButton: {
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
  },
});