// MyCrew React Native - Contacts Screen
// Écran principal avec encart profil et bouton paramètres flottant

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Text,
  Animated,
  StatusBar,
  Modal,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { DatabaseService } from '../services/DatabaseService';
import { MyCrewColors } from '../constants/Colors';
import { Contact, UserProfile, RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

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
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

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
        <View style={styles.nameContainer}>
          <Text style={styles.contactName} numberOfLines={1}>
            {contact.name}
          </Text>
          {contact.isFavorite && (
            <Ionicons 
              name="star" 
              size={16} 
              color="#FFD700" 
              style={styles.favoriteIcon}
            />
          )}
        </View>
        <Text style={styles.contactJob} numberOfLines={1}>
          {contact.jobTitle}
        </Text>
        {city && (
          <Text style={styles.contactCity} numberOfLines={1}>
            {city}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.qrButton}
        onPress={onQRPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons 
          name="qr-code-outline" 
          size={24} 
          color={MyCrewColors.iconMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

interface ProfileCardProps {
  profile: UserProfile | null;
  onPress: () => void;
  onQRPress: () => void;
}

function ProfileCard({ profile, onPress, onQRPress }: ProfileCardProps) {
  if (!profile) {
    return (
      <TouchableOpacity style={styles.profileCard} onPress={onPress}>
        <Ionicons name="person" size={32} color={MyCrewColors.background} style={styles.profileIcon} />
        <View style={styles.profileContent}>
          <Text style={styles.profileEmpty}>Créer mon profil</Text>
        </View>
        <TouchableOpacity style={styles.profileQRButton} onPress={onQRPress}>
          <Ionicons name="qr-code" size={28} color={MyCrewColors.background} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.profileCard} onPress={onPress}>
      <Ionicons name="person" size={32} color={MyCrewColors.background} style={styles.profileIcon} />
      <View style={styles.profileContent}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileJob}>{profile.jobTitle}</Text>
      </View>
      <TouchableOpacity style={styles.profileQRButton} onPress={onQRPress}>
        <Ionicons name="qr-code" size={28} color={MyCrewColors.background} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

interface QRModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  contact: Contact | null;
}

function QRModal({ visible, onClose, profile, contact }: QRModalProps) {
  const displayData = contact || profile;
  const title = contact ? 'QR Code Contact' : 'Mon QR Code';
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackground} onPress={onClose} />
        <View style={styles.qrModalContent}>
          <View style={styles.qrModalHeader}>
            <Text style={styles.qrModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.qrCodeContainer}>
            <View style={styles.fakeQRCode}>
              <Ionicons name="qr-code" size={120} color={MyCrewColors.accent} />
              <Text style={styles.qrPlaceholder}>QR Code à venir</Text>
            </View>
          </View>
          
          {displayData && (
            <View style={styles.qrModalInfo}>
              <Text style={styles.qrModalName}>{displayData.name}</Text>
              <Text style={styles.qrModalJob}>{displayData.jobTitle}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function ContactsScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  // Animation pour le bouton paramètres
  const scrollY = useRef(new Animated.Value(0)).current;
  const settingsButtonScale = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [1, 0.8, 0.5],
    extrapolate: 'clamp',
  });
  const settingsButtonOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.7],
    extrapolate: 'clamp',
  });

  const loadData = async () => {
    try {
      const db = DatabaseService.getInstance();
      const [contactsData, userProfile] = await Promise.all([
        db.getAllContacts(),
        db.getUserProfile(),
      ]);
      
      setContacts(contactsData);
      setFilteredContacts(contactsData);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
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
      setFilteredContacts([]);
    }
  }, [contacts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Recharger les données quand l'écran devient actif
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Effet pour la recherche
  useEffect(() => {
    searchContacts(searchText);
  }, [searchText, searchContacts]);

  const handleContactPress = (contact: Contact) => {
    navigation.navigate('ContactDetail' as never, { contactId: contact.id } as never);
  };

  const handleContactQRPress = (contact: Contact) => {
    setSelectedContact(contact);
    setShowQRModal(true);
  };

  const handleProfilePress = () => {
    if (profile) {
      navigation.navigate('Profile' as never);
    } else {
      navigation.navigate('UserProfileEditor' as never);
    }
  };

  const handleProfileQRPress = () => {
    if (profile) {
      setSelectedContact(null); // Reset selected contact
      setShowQRModal(true);
    } else {
      Alert.alert('Aucun profil', 'Créez d\'abord votre profil pour générer un QR code.');
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings' as never);
  };

  // Group contacts by first letter
  const groupContactsByLetter = (contacts: Contact[]) => {
    const grouped = contacts.reduce((acc, contact) => {
      const firstLetter = contact.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    // Sort letters and return sections
    return Object.keys(grouped).sort().map(letter => ({
      letter,
      data: grouped[letter].sort((a, b) => a.name.localeCompare(b.name))
    }));
  };

  const contactSections = groupContactsByLetter(filteredContacts);

  const renderSectionHeader = ({ section }: { section: { letter: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.letter}</Text>
    </View>
  );

  const renderContact = ({ item }: { item: Contact }) => (
    <ContactRow
      contact={item}
      onPress={() => handleContactPress(item)}
      onQRPress={() => handleContactQRPress(item)}
    />
  );

  const ListHeaderComponent = () => (
    <View>
      {/* Encart de profil */}
      <ProfileCard
        profile={profile}
        onPress={handleProfilePress}
        onQRPress={handleProfileQRPress}
      />
      
      {/* Titre de section et bouton ajouter */}
      <View style={styles.contactsHeaderContainer}>
        <Text style={styles.contactsTitle}>Mes Contacts</Text>
        <TouchableOpacity 
          style={styles.addContactButton}
          onPress={() => navigation.navigate('AddContact' as never)}
        >
          <Ionicons name="add" size={24} color={MyCrewColors.accent} />
        </TouchableOpacity>
      </View>
      
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={MyCrewColors.iconMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un contact..."
            placeholderTextColor={MyCrewColors.placeholderText}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color={MyCrewColors.iconMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={MyCrewColors.background} />
      
      {/* Header avec logo et tagline */}
      <View style={styles.titleContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/logo.png')} style={styles.logoImage} />
          <Text style={styles.tagline}>Trouvez, contactez, tournez</Text>
        </View>
      </View>

      <SectionList
        sections={contactSections}
        renderItem={renderContact}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        stickySectionHeadersEnabled={true}
      />

      {/* Bouton paramètres flottant */}
      <Animated.View style={[
        styles.settingsButton,
        { 
          transform: [{ scale: settingsButtonScale }],
          opacity: settingsButtonOpacity
        }
      ]}>
        <TouchableOpacity
          style={styles.settingsButtonInner}
          onPress={handleSettingsPress}
        >
          <Ionicons name="settings" size={24} color={MyCrewColors.background} />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal QR Code */}
      <QRModal
        visible={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedContact(null);
        }}
        profile={profile}
        contact={selectedContact}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  titleContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  tagline: {
    fontSize: Typography.subheadline,
    color: MyCrewColors.textSecondary,
    fontStyle: 'italic',
    marginLeft: Spacing.md,
  },
  listContent: {
    paddingBottom: 100, // Espace pour le bouton flottant
  },
  
  // Encart de profil
  profileCard: {
    backgroundColor: MyCrewColors.accent,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.medium,
  },
  profileIcon: {
    marginRight: Spacing.md,
  },
  profileContent: {
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
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  profileEmpty: {
    fontSize: Typography.subheadline,
    color: MyCrewColors.background,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  profileQRButton: {
    padding: Spacing.sm,
  },
  
  // Header des contacts
  contactsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  contactsTitle: {
    fontSize: Typography.title,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  addContactButton: {
    padding: Spacing.sm,
  },
  
  // Barre de recherche
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
  
  
  // Lignes de contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  contactInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  contactName: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  favoriteIcon: {
    marginLeft: Spacing.xs,
  },
  contactJob: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  contactCity: {
    fontSize: Typography.small,
    color: MyCrewColors.iconMuted,
  },
  qrButton: {
    padding: Spacing.sm,
  },
  
  // Bouton paramètres flottant
  settingsButton: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
  },
  settingsButtonInner: {
    backgroundColor: MyCrewColors.accent,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.medium,
  },
  
  // Modal QR
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  qrModalContent: {
    backgroundColor: MyCrewColors.background,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    margin: Spacing.xl,
    maxWidth: width * 0.9,
    ...Shadows.medium,
  },
  qrModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  qrModalTitle: {
    fontSize: Typography.title,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  fakeQRCode: {
    width: 200,
    height: 200,
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MyCrewColors.border,
  },
  qrPlaceholder: {
    fontSize: Typography.small,
    color: MyCrewColors.textSecondary,
    marginTop: Spacing.sm,
  },
  qrModalInfo: {
    alignItems: 'center',
  },
  qrModalName: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.xs,
  },
  qrModalJob: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
  },
  
  // Section headers
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  sectionHeaderText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: MyCrewColors.iconMuted,
    letterSpacing: 1,
  },
});