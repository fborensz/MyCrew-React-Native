// MyCrew React Native - Contacts Screen
// Écran principal avec encart profil et bouton paramètres flottant

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { DatabaseService } from '../services/DatabaseService';
import { MyCrewColors } from '../constants/Colors';
import { Contact, UserProfile, RootStackParamList, getContactFullName, getUserProfileFullName } from '../types';
import { FILM_DEPARTMENTS } from '../data/JobTitles';
import { COUNTRIES_WITH_REGIONS } from '../data/Locations';
import ExportModal from '../components/ExportModal';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { ImportService } from '../services/ImportService';

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
  const primaryLocation = contact.locations && contact.locations.length > 0 
    ? contact.locations.find(loc => loc.isPrimary) 
    : null;
  const city = primaryLocation?.region || primaryLocation?.country || '';

  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress}>
      <View style={styles.contactInfo}>
        <View style={styles.nameContainer}>
          <Text style={styles.contactName} numberOfLines={1}>
            {getContactFullName(contact)}
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
        <Text style={styles.profileName}>{getUserProfileFullName(profile)}</Text>
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
          </TouchableOpacity>
          
          <QRCodeDisplay 
            contact={contact || undefined}
            profile={profile || undefined}
            size={180}
            showTitle={false}
            showDebugInfo={false}
          />
        </View>
      </View>
    </Modal>
  );
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  activeFilters: {
    job: string | null;
    country: string | null;
    regions: string[];
    isHoused: boolean;
    isLocalResident: boolean;
    hasVehicle: boolean;
  };
  onApplyFilters: (filters: any) => void;
  onClearFilters: () => void;
}

function FilterModal({ visible, onClose, activeFilters, onApplyFilters, onClearFilters }: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState(activeFilters);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);
  
  useEffect(() => {
    setTempFilters(activeFilters);
  }, [activeFilters, visible]);

  useEffect(() => {
    console.log('FilterModal visible:', visible);
  }, [visible]);

  const allJobs = React.useMemo(() => {
    try {
      if (FILM_DEPARTMENTS && FILM_DEPARTMENTS.length > 0) {
        // Convert all jobs to masculine form to avoid filter bugs (réalisateur/réalisatrice)
        return FILM_DEPARTMENTS.flatMap(dept => dept.jobs).map(job => {
          // Convert feminine forms to masculine
          const masculineJobs = {
            'Réalisatrice': 'Réalisateur',
            'Maquilleuse': 'Maquilleur',
            'Costumière': 'Costumier',
            'Assistante Réalisatrice': 'Assistant Réalisateur',
            'Monteuse': 'Monteur',
            'Monteuse Son': 'Monteur Son',
            'Scripte': 'Script'
          };
          return masculineJobs[job as keyof typeof masculineJobs] || job;
        }).filter((job, index, array) => array.indexOf(job) === index); // Remove duplicates
      }
      // Fallback data if import fails
      return [
        'Réalisateur', 'Chef opérateur', 'Cadreur', 'Ingénieur du Son', 'Chef Décorateur',
        'Assistant Réalisateur', 'Script', 'Monteur', 'Producteur', 'Régisseur Général',
        'Chef Électro (Gaffer)', 'Maquilleur', 'Costumier', 'Chef Machiniste',
        'Directeur Photo', 'Perchman', 'Monteur Son', 'Étalonneur'
      ];
    } catch (error) {
      console.error('Error loading jobs:', error);
      return ['Réalisateur', 'Chef opérateur', 'Cadreur', 'Ingénieur du Son', 'Chef Décorateur'];
    }
  }, []);

  const allCountries = React.useMemo(() => {
    try {
      if (COUNTRIES_WITH_REGIONS && Object.keys(COUNTRIES_WITH_REGIONS).length > 0) {
        const countries = Object.keys(COUNTRIES_WITH_REGIONS);
        // Put "Worldwide" at the top
        const sortedCountries = countries.filter(c => c !== 'Worldwide').sort();
        return countries.includes('Worldwide') ? ['Worldwide', ...sortedCountries] : sortedCountries;
      }
      // Fallback data if import fails
      return ['Worldwide', 'France', 'Belgique', 'Suisse', 'Canada', 'États-Unis', 'Royaume-Uni'];
    } catch (error) {
      console.error('Error loading countries:', error);
      return ['Worldwide', 'France', 'Belgique', 'Suisse'];
    }
  }, []);

  const availableRegions = React.useMemo(() => {
    try {
      if (tempFilters.country === 'France' && COUNTRIES_WITH_REGIONS && COUNTRIES_WITH_REGIONS['France']) {
        return ['Toute la France', ...COUNTRIES_WITH_REGIONS['France']];
      }
      // Fallback French regions if import fails
      if (tempFilters.country === 'France') {
        return [
          'Toute la France', 'Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Auvergne-Rhône-Alpes',
          'Nouvelle-Aquitaine', 'Occitanie', 'Hauts-de-France', 'Grand Est',
          'Pays de la Loire', 'Bretagne', 'Normandie', 'Centre-Val de Loire'
        ];
      }
      return [];
    } catch (error) {
      console.error('Error loading regions:', error);
      return [];
    }
  }, [tempFilters.country]);

  const toggleJobFilter = (job: string) => {
    setTempFilters(prev => ({
      ...prev,
      job: prev.job === job ? null : job
    }));
  };

  const toggleCountryFilter = (country: string) => {
    setTempFilters(prev => {
      const newCountry = prev.country === country ? null : country;
      
      // Clear regions if France is deselected or country changes
      const newRegions = (newCountry !== 'France') ? [] : prev.regions;

      return {
        ...prev,
        country: newCountry,
        regions: newRegions
      };
    });
  };

  const toggleRegionFilter = (region: string) => {
    setTempFilters(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region]
    }));
  };

  const toggleAttributeFilter = (attribute: 'isHoused' | 'isLocalResident' | 'hasVehicle') => {
    setTempFilters(prev => ({
      ...prev,
      [attribute]: !prev[attribute]
    }));
  };

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters = {
      job: null,
      country: null,
      regions: [],
      isHoused: false,
      isLocalResident: false,
      hasVehicle: false,
    };
    setTempFilters(clearedFilters);
    onClearFilters();
    onClose();
  };

  if (!visible) {
    return null;
  }

  console.log('FilterModal rendering with allJobs:', allJobs.length, 'allCountries:', allCountries.length);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.filterModalOverlay}>
        <View style={styles.filterModalContent}>
          {/* Header */}
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filtres de recherche</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.filterModalBody} showsVerticalScrollIndicator={false}>
            {/* Jobs Section - Dropdown */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Métier</Text>
              <TouchableOpacity
                style={styles.filterDropdown}
                onPress={() => setShowJobPicker(true)}
              >
                <Text style={[styles.filterDropdownText, !tempFilters.job && styles.filterDropdownPlaceholder]}>
                  {tempFilters.job || 'Choisir un métier'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={MyCrewColors.iconMuted} />
              </TouchableOpacity>
            </View>

            {/* Countries Section - Dropdown */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Pays</Text>
              <TouchableOpacity
                style={styles.filterDropdown}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={[styles.filterDropdownText, !tempFilters.country && styles.filterDropdownPlaceholder]}>
                  {tempFilters.country || 'Choisir un pays'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={MyCrewColors.iconMuted} />
              </TouchableOpacity>
            </View>

            {/* Regions Section (only if France is selected) - Dropdown for multiple selection */}
            {tempFilters.country === 'France' && (
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Régions françaises</Text>
                <TouchableOpacity
                  style={styles.filterDropdown}
                  onPress={() => setShowRegionPicker(true)}
                >
                  <Text style={[styles.filterDropdownText, tempFilters.regions.length === 0 && styles.filterDropdownPlaceholder]}>
                    {tempFilters.regions.length > 0 
                      ? tempFilters.regions.length === 1 
                        ? tempFilters.regions[0]
                        : `${tempFilters.regions.length} régions sélectionnées`
                      : 'Choisir des régions'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={MyCrewColors.iconMuted} />
                </TouchableOpacity>
              </View>
            )}

            {/* Attributes Section */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Attributs</Text>
              <View style={styles.attributesContainer}>
                <TouchableOpacity
                  style={styles.attributeRow}
                  onPress={() => toggleAttributeFilter('isLocalResident')}
                >
                  <Ionicons
                    name={tempFilters.isLocalResident ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={tempFilters.isLocalResident ? MyCrewColors.accent : MyCrewColors.iconMuted}
                  />
                  <Text style={styles.attributeText}>Résidence fiscale</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attributeRow}
                  onPress={() => toggleAttributeFilter('hasVehicle')}
                >
                  <Ionicons
                    name={tempFilters.hasVehicle ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={tempFilters.hasVehicle ? MyCrewColors.accent : MyCrewColors.iconMuted}
                  />
                  <Text style={styles.attributeText}>Véhiculé</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.attributeRow}
                  onPress={() => toggleAttributeFilter('isHoused')}
                >
                  <Ionicons
                    name={tempFilters.isHoused ? 'checkbox' : 'square-outline'}
                    size={20}
                    color={tempFilters.isHoused ? MyCrewColors.accent : MyCrewColors.iconMuted}
                  />
                  <Text style={styles.attributeText}>Logé sur place</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.filterModalFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Supprimer filtres</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Valider</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Job Picker Overlay */}
      {showJobPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choisir un métier</Text>
              <TouchableOpacity onPress={() => setShowJobPicker(false)}>
                <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  setTempFilters(prev => ({ ...prev, job: null }));
                  setShowJobPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, !tempFilters.job && styles.pickerItemTextActive]}>Aucun filtre</Text>
              </TouchableOpacity>
              {allJobs.map((job) => (
                <TouchableOpacity
                  key={job}
                  style={styles.pickerItem}
                  onPress={() => {
                    toggleJobFilter(job);
                    setShowJobPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, tempFilters.job === job && styles.pickerItemTextActive]}>
                    {job}
                  </Text>
                  {tempFilters.job === job && (
                    <Ionicons name="checkmark" size={20} color={MyCrewColors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Country Picker Overlay */}
      {showCountryPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choisir un pays</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  setTempFilters(prev => ({ ...prev, country: null, regions: [] }));
                  setShowCountryPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, !tempFilters.country && styles.pickerItemTextActive]}>Aucun filtre</Text>
              </TouchableOpacity>
              {allCountries.map((country) => (
                <TouchableOpacity
                  key={country}
                  style={styles.pickerItem}
                  onPress={() => {
                    toggleCountryFilter(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, tempFilters.country === country && styles.pickerItemTextActive]}>
                    {country}
                  </Text>
                  {tempFilters.country === country && (
                    <Ionicons name="checkmark" size={20} color={MyCrewColors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      
      {/* Region Picker Overlay */}
      {showRegionPicker && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Choisir des régions</Text>
              <TouchableOpacity onPress={() => setShowRegionPicker(false)}>
                <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerList}>
              {availableRegions.map((region) => (
                <TouchableOpacity
                  key={region}
                  style={styles.pickerItem}
                  onPress={() => toggleRegionFilter(region)}
                >
                  <Text style={[styles.pickerItemText, tempFilters.regions.includes(region) && styles.pickerItemTextActive]}>
                    {region}
                  </Text>
                  {tempFilters.regions.includes(region) && (
                    <Ionicons name="checkmark" size={20} color={MyCrewColors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerDoneButton}
              onPress={() => setShowRegionPicker(false)}
            >
              <Text style={styles.pickerDoneButtonText}>Terminé</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Modal>
  );
}


export default function ContactsScreen() {
  const navigation = useNavigation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<Contact | UserProfile | Contact[] | null>(null);
  const [exportType, setExportType] = useState<'contact' | 'profile' | 'contacts'>('contacts');
  const [showImportMenu, setShowImportMenu] = useState(false);
  
  useEffect(() => {
    console.log('showFiltersModal state changed:', showFiltersModal);
  }, [showFiltersModal]);

  // Fonction de recherche optimisée pour maintenir le focus
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsSearchFocused(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchText('');
    searchInputRef.current?.focus();
  }, []);

  const keyExtractor = useCallback((item: Contact) => item.id, []);
  
  // Filter states
  const [activeFilters, setActiveFilters] = useState({
    job: null as string | null,
    country: null as string | null,
    regions: [] as string[],
    isHoused: false,
    isLocalResident: false,
    hasVehicle: false,
  });
  
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
      setProfile(userProfile);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };


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

  // Filtrage et groupement des contacts optimisés
  const contactSections = useMemo(() => {
    let filteredResults = [...contacts];
    
    // Recherche textuelle simple
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      filteredResults = filteredResults.filter(contact => {
        try {
          const fullName = getContactFullName(contact);
          return (
            fullName.toLowerCase().includes(searchLower) ||
            (contact.jobTitle && contact.jobTitle.toLowerCase().includes(searchLower)) ||
            (contact.phone && contact.phone.includes(searchText.trim())) ||
            (contact.email && contact.email.toLowerCase().includes(searchLower))
          );
        } catch (error) {
          console.error('Filter error for contact:', contact, error);
          return false;
        }
      });
    }

    // Groupement par lettre directement dans le useMemo
    const grouped = filteredResults.reduce((acc, contact) => {
      const firstLetter = contact.lastName.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    // Retourner les sections triées
    return Object.keys(grouped).sort().map(letter => ({
      letter,
      data: grouped[letter].sort((a, b) => {
        const lastNameCompare = (a.lastName || '').localeCompare(b.lastName || '', 'fr', { sensitivity: 'base' });
        if (lastNameCompare !== 0) return lastNameCompare;
        return (a.firstName || '').localeCompare(b.firstName || '', 'fr', { sensitivity: 'base' });
      })
    }));
  }, [contacts, searchText]);
  

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

  const handleApplyFilters = (filters: typeof activeFilters) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters({
      jobs: [],
      countries: [],
      regions: [],
      isHoused: false,
      isLocalResident: false,
      hasVehicle: false,
    });
  };

  const removeFilter = (type: string, value?: string) => {
    setActiveFilters(prev => {
      switch (type) {
        case 'job':
          return { ...prev, job: null };
        case 'country':
          // Clear regions if France is removed
          const newRegions = prev.country === 'France' ? [] : prev.regions;
          return { ...prev, country: null, regions: newRegions };
        case 'region':
          return { ...prev, regions: prev.regions.filter(r => r !== value) };
        case 'isHoused':
          return { ...prev, isHoused: false };
        case 'isLocalResident':
          return { ...prev, isLocalResident: false };
        case 'hasVehicle':
          return { ...prev, hasVehicle: false };
        default:
          return prev;
      }
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({
      job: null,
      country: null,
      regions: [],
      isHoused: false,
      isLocalResident: false,
      hasVehicle: false,
    });
  };
  
  const handleImportPress = async () => {
    try {
      const result = await ImportService.importFromFile();
      
      if (result.success) {
        Alert.alert(
          'Import réussi',
          `${result.imported} contact(s) importé(s) avec succès${result.duplicates > 0 ? `, ${result.duplicates} doublon(s) ignoré(s)` : ''}`
        );
        // Recharger les données
        loadData();
      } else if (result.errors.length > 0) {
        Alert.alert(
          'Erreur d\'import',
          result.errors.join('\n') || 'Une erreur inconnue s\'est produite'
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Erreur', 'Impossible d\'importer le fichier');
    }
  };


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

  // Header stable avec useMemo pour éviter les re-montages du TextInput
  const ListHeaderComponent = useMemo(() => (
    <View>
      {/* Titre de section et boutons d'action */}
      <View style={styles.contactsHeaderContainer}>
        <Text style={styles.contactsTitle}>Mes Contacts</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => {
              setExportData(contacts);
              setExportType('contacts');
              setShowExportModal(true);
            }}
          >
            <Ionicons name="share-outline" size={22} color={MyCrewColors.accent} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.importButton}
            onPress={() => setShowImportMenu(!showImportMenu)}
          >
            <Ionicons name="download-outline" size={22} color={MyCrewColors.accent} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addContactButton}
            onPress={() => navigation.navigate('AddContact' as never)}
          >
            <Ionicons name="add" size={24} color={MyCrewColors.accent} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TouchableOpacity 
            onPress={() => {
              console.log('Filter button pressed');
              setShowFiltersModal(true);
            }} 
            style={styles.filterButton}
          >
            <Ionicons name="options" size={20} color={MyCrewColors.iconMuted} />
          </TouchableOpacity>
          <TextInput
            ref={searchInputRef}
            style={[
              styles.searchInput,
              isSearchFocused && styles.searchInputFocused
            ]}
            placeholder="Rechercher un contact..."
            placeholderTextColor={MyCrewColors.placeholderText}
            value={searchText}
            onChangeText={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            blurOnSubmit={false}
            textContentType="none"
            autoComplete="off"
            keyboardType="default"
            enablesReturnKeyAutomatically={false}
            spellCheck={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearSearch}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={MyCrewColors.iconMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Filtres actifs */}
      {(activeFilters.job || 
        activeFilters.country || 
        activeFilters.regions.length > 0 || 
        activeFilters.isHoused || 
        activeFilters.isLocalResident || 
        activeFilters.hasVehicle) && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFiltersHeader}>
            <Text style={styles.activeFiltersTitle}>Filtres actifs :</Text>
            <TouchableOpacity 
              style={styles.clearAllButton}
              onPress={clearAllFilters}
            >
              <Ionicons name="close-circle" size={18} color="#dc3545" style={{ marginRight: 4 }} />
              <Text style={styles.clearAllText}>supprimer les filtres</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activeFiltersScrollContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.activeFiltersScroll}
              contentContainerStyle={styles.activeFiltersScrollContent}
            >
              {activeFilters.job && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => removeFilter('job')}
                >
                  <Text style={styles.activeFilterText}>{activeFilters.job}</Text>
                  <Ionicons name="close" size={14} color={MyCrewColors.background} />
                </TouchableOpacity>
              )}
              
              {activeFilters.country && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => removeFilter('country')}
                >
                  <Text style={styles.activeFilterText}>{activeFilters.country}</Text>
                  <Ionicons name="close" size={14} color={MyCrewColors.background} />
                </TouchableOpacity>
              )}
              
              {activeFilters.regions.map(region => (
                <TouchableOpacity
                  key={region}
                  style={styles.activeFilterChip}
                  onPress={() => removeFilter('region', region)}
                >
                  <Text style={styles.activeFilterText}>{region}</Text>
                  <Ionicons name="close" size={14} color={MyCrewColors.background} />
                </TouchableOpacity>
              ))}
              
              {activeFilters.isLocalResident && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => removeFilter('isLocalResident')}
                >
                  <Text style={styles.activeFilterText}>Résidence fiscale</Text>
                  <Ionicons name="close" size={14} color={MyCrewColors.background} />
                </TouchableOpacity>
              )}
              
              {activeFilters.hasVehicle && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => removeFilter('hasVehicle')}
                >
                  <Text style={styles.activeFilterText}>Véhiculé</Text>
                  <Ionicons name="close" size={14} color={MyCrewColors.background} />
                </TouchableOpacity>
              )}
              
              {activeFilters.isHoused && (
                <TouchableOpacity
                  style={styles.activeFilterChip}
                  onPress={() => removeFilter('isHoused')}
                >
                  <Text style={styles.activeFilterText}>Logé</Text>
                  <Ionicons name="close" size={14} color={MyCrewColors.background} />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      )}
      
    </View>
  ), [searchText, isSearchFocused, activeFilters, contacts, handleSearchChange, handleSearchFocus, handleSearchBlur, handleClearSearch, handleImportPress]);

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

      {/* Encart de profil fixe */}
      <ProfileCard
        profile={profile}
        onPress={handleProfilePress}
        onQRPress={handleProfileQRPress}
      />

      <SectionList
        sections={contactSections}
        renderItem={renderContact}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
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

      {/* Modal Filtres */}
      <FilterModal
        visible={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        activeFilters={activeFilters}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />
      
      {/* Modal Export */}
      {exportData && (
        <ExportModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={exportData}
          type={exportType}
        />
      )}

      {/* Menu dropdown d'import */}
      {showImportMenu && (
        <>
          <TouchableOpacity
            style={styles.importMenuOverlay}
            onPress={() => setShowImportMenu(false)}
            activeOpacity={1}
          />
          <View style={styles.importDropdownMenu}>
            <TouchableOpacity
              style={styles.importMenuItem}
              onPress={() => {
                setShowImportMenu(false);
                navigation.navigate('QRScanner');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="qr-code-outline" size={18} color={MyCrewColors.accent} />
              <Text style={styles.importMenuText}>Scan QR Code</Text>
            </TouchableOpacity>
            
            <View style={styles.importMenuSeparator} />
            
            <TouchableOpacity
              style={styles.importMenuItem}
              onPress={() => {
                console.log('Fichier option cliqué');
                setShowImportMenu(false);
                handleImportPress();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="document-outline" size={18} color={MyCrewColors.accent} />
              <View style={styles.importMenuTextContainer}>
                <Text style={styles.importMenuText}>Fichier</Text>
                <Text style={styles.importMenuSubText}>(JSON, CSV, vCard)</Text>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

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
  profileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  profileActionButton: {
    padding: Spacing.sm,
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  importButton: {
    padding: Spacing.sm,
  },
  exportButton: {
    padding: Spacing.sm,
  },
  addContactButton: {
    padding: Spacing.sm,
  },
  
  // Menu dropdown import
  importDropdownMenu: {
    position: 'absolute',
    top: 240, // Position approximative sous le bouton import
    right: 20,
    backgroundColor: MyCrewColors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    minWidth: 180,
    maxWidth: 220,
    ...Shadows.medium,
    zIndex: 1001,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  importMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    minHeight: 44, // Hauteur minimum pour une bonne zone de clic
  },
  importMenuTextContainer: {
    flex: 1,
  },
  importMenuText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    fontWeight: '500',
  },
  importMenuSubText: {
    fontSize: Typography.small,
    color: MyCrewColors.textSecondary,
    marginTop: 2,
  },
  importMenuTextDisabled: {
    color: MyCrewColors.iconMuted,
  },
  importMenuBadge: {
    fontSize: Typography.small,
    color: MyCrewColors.iconMuted,
    fontStyle: 'italic',
  },
  importMenuSeparator: {
    height: 1,
    backgroundColor: MyCrewColors.border,
    marginVertical: Spacing.xs,
  },
  importMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
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
  filterButton: {
    padding: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    paddingVertical: 0, // Évite les problèmes de height sur Android
    includeFontPadding: false, // Android uniquement
  },
  searchInputFocused: {
    // Style légèrement différent quand focalisé pour indiquer l'état
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
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  contactActionButton: {
    padding: Spacing.sm,
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
    padding: Spacing.lg,
    alignItems: 'center',
    alignSelf: 'center',
    ...Shadows.medium,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: Spacing.xs,
    marginBottom: Spacing.sm,
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
  
  // Active filters
  activeFiltersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  activeFiltersTitle: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: MyCrewColors.textSecondary,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  clearAllText: {
    fontSize: Typography.small,
    color: '#dc3545',
    fontWeight: '500',
  },
  activeFiltersScrollContainer: {
    position: 'relative',
  },
  activeFiltersScroll: {
    flexGrow: 0,
  },
  activeFiltersScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingRight: 10,
  },
  activeFilterChip: {
    backgroundColor: MyCrewColors.accent,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  activeFilterText: {
    fontSize: Typography.small,
    color: MyCrewColors.background,
    fontWeight: '500',
  },
  
  // Filter modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: height * 0.85,
    minHeight: height * 0.6,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  filterModalTitle: {
    fontSize: Typography.title,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  filterModalBody: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterSectionTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.md,
  },
  filterList: {
    gap: Spacing.xs,
  },
  filterListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  filterListText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    flex: 1,
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: MyCrewColors.cardBackground,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  filterDropdownText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    flex: 1,
  },
  filterDropdownPlaceholder: {
    color: MyCrewColors.gray,
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: MyCrewColors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: height * 0.6,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  pickerTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  pickerList: {
    paddingVertical: Spacing.sm,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  pickerItemText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
  pickerItemTextActive: {
    color: MyCrewColors.accent,
    fontWeight: '600',
  },
  pickerDoneButton: {
    backgroundColor: MyCrewColors.accent,
    marginHorizontal: Spacing.xl,
    marginVertical: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  pickerDoneButtonText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: MyCrewColors.background,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  filterChip: {
    backgroundColor: MyCrewColors.cardBackground,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: MyCrewColors.accent,
    borderColor: MyCrewColors.accent,
  },
  filterChipText: {
    fontSize: Typography.small,
    color: MyCrewColors.textPrimary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: MyCrewColors.background,
  },
  attributesContainer: {
    gap: Spacing.md,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  attributeText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: MyCrewColors.border,
    gap: Spacing.md,
  },
  clearButton: {
    flex: 1,
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: MyCrewColors.textSecondary,
  },
  applyButton: {
    flex: 1,
    backgroundColor: MyCrewColors.accent,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: MyCrewColors.background,
  },
});