// MyCrew React Native - User Profile Editor Screen
// Formulaire complet pour éditer le profil utilisateur

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';

import { MyCrewColors } from '../constants/Colors';
import { userProfileValidationSchema } from '../utils/validation';
import { FILM_DEPARTMENTS } from '../data/JobTitles';
import { COUNTRIES_WITH_REGIONS } from '../data/Locations';
import { DatabaseService } from '../services/DatabaseService';
import { UserProfile, Location } from '../types';

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

interface UserProfileFormData {
  name: string;
  jobTitle: string;
  phoneNumber: string;
  email: string;
  locations: Omit<Location, 'id'>[];
}

export default function UserProfileEditorScreen() {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [locations, setLocations] = useState<Omit<Location, 'id'>[]>([
    {
      country: 'France',
      region: 'Île-de-France',
      isLocalResident: false,
      hasVehicle: false,
      isHoused: false,
      isPrimary: true, // Le premier lieu est toujours principal
    },
  ]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UserProfileFormData>({
    resolver: yupResolver(userProfileValidationSchema),
    defaultValues: {
      name: '',
      jobTitle: '',
      phoneNumber: '',
      email: '',
      locations: locations,
    },
  });

  // Charger le profil existant au focus
  useFocusEffect(
    React.useCallback(() => {
      loadExistingProfile();
    }, [])
  );

  const loadExistingProfile = async () => {
    try {
      setIsLoading(true);
      const db = DatabaseService.getInstance();
      const profile = await db.getUserProfile();
      
      if (profile) {
        // Remplir le formulaire avec les données existantes
        const processedLocations = profile.locations.map((loc, index) => ({
          country: loc.country,
          region: loc.region || '',
          isLocalResident: loc.isLocalResident,
          hasVehicle: loc.hasVehicle,
          isHoused: loc.isHoused,
          isPrimary: index === 0, // Le premier lieu est toujours principal
        }));
        
        reset({
          name: profile.name,
          jobTitle: profile.jobTitle,
          phoneNumber: profile.phoneNumber,
          email: profile.email,
          locations: processedLocations,
        });
        
        setLocations(processedLocations);
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const allJobs = FILM_DEPARTMENTS.flatMap(dept => dept.jobs);

  const onSubmit = async (data: UserProfileFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const db = DatabaseService.getInstance();
      
      // Créer l'objet UserProfile avec les IDs générés
      const profileData: UserProfile = {
        name: data.name,
        jobTitle: data.jobTitle,
        phoneNumber: data.phoneNumber,
        email: data.email,
        isFavorite: false, // Les profils ne sont pas marqués comme favoris
        locations: data.locations.map((loc, index) => ({
          id: `profile_location_${Date.now()}_${index}`,
          country: loc.country,
          region: loc.region || '',
          isLocalResident: loc.isLocalResident,
          hasVehicle: loc.hasVehicle,
          isHoused: loc.isHoused,
          isPrimary: index === 0, // Le premier lieu est toujours principal
        })),
      };
      
      await db.saveUserProfile(profileData);
      
      Alert.alert(
        'Profil sauvegardé',
        'Votre profil a été mis à jour avec succès.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error);
      Alert.alert(
        'Erreur',
        'Impossible de sauvegarder votre profil. Vérifiez vos données.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLocation = () => {
    const newLocation: Omit<Location, 'id'> = {
      country: 'France',
      region: 'Île-de-France', 
      isLocalResident: false,
      hasVehicle: false,
      isHoused: false,
      isPrimary: false, // Les nouveaux lieux ne sont jamais principaux par défaut
    };
    
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    setValue('locations', updatedLocations);
  };

  const removeLocation = (index: number) => {
    let updatedLocations = locations.filter((_, i) => i !== index);
    
    // Après suppression, s'assurer que le premier lieu (index 0) est toujours principal
    if (updatedLocations.length > 0) {
      updatedLocations = updatedLocations.map((loc, i) => ({
        ...loc,
        isPrimary: i === 0, // Le premier lieu devient automatiquement principal
      }));
    }
    
    setLocations(updatedLocations);
    setValue('locations', updatedLocations);
  };

  // Supprimer la fonction toggleLocationPrimary car on n'en a plus besoin

  const updateLocation = (index: number, field: keyof Omit<Location, 'id'>, value: any) => {
    let updatedLocations = locations.map((loc, i) =>
      i === index ? { ...loc, [field]: value } : loc
    );
    
    // S'assurer que le premier lieu reste toujours principal
    updatedLocations = updatedLocations.map((loc, i) => ({
      ...loc,
      isPrimary: i === 0,
    }));
    
    setLocations(updatedLocations);
    setValue('locations', updatedLocations);
  };

  const JobPicker = () => {
    if (!showJobPicker) return null;
    
    return (
      <View style={styles.jobPickerContainer}>
        <View style={styles.jobPickerHeader}>
          <Text style={styles.jobPickerTitle}>Choisir un métier</Text>
          <TouchableOpacity onPress={() => setShowJobPicker(false)}>
            <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.jobsList}>
          {FILM_DEPARTMENTS.map((dept) => (
            <View key={dept.name} style={styles.department}>
              <Text style={styles.departmentTitle}>{dept.name}</Text>
              {dept.jobs.map((job) => (
                <TouchableOpacity
                  key={job}
                  style={styles.jobItem}
                  onPress={() => {
                    setValue('jobTitle', job);
                    setShowJobPicker(false);
                  }}
                >
                  <Text style={styles.jobText}>{job}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nom complet *
              {errors.name && <Text style={styles.errorText}> - {errors.name.message}</Text>}
            </Text>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Prénom Nom"
                  placeholderTextColor={MyCrewColors.placeholderText}
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Métier *
              {errors.jobTitle && <Text style={styles.errorText}> - {errors.jobTitle.message}</Text>}
            </Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput, errors.jobTitle && styles.inputError]}
              onPress={() => setShowJobPicker(true)}
            >
              <Controller
                control={control}
                name="jobTitle"
                render={({ field: { value } }) => (
                  <Text style={[styles.inputText, !value && styles.placeholder]}>
                    {value || 'Choisir un métier'}
                  </Text>
                )}
              />
              <Ionicons name="chevron-down" size={20} color={MyCrewColors.iconMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Téléphone *
              {errors.phoneNumber && <Text style={styles.errorText}> - {errors.phoneNumber.message}</Text>}
            </Text>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phoneNumber && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="+33 6 12 34 56 78"
                  placeholderTextColor={MyCrewColors.placeholderText}
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email *
              {errors.email && <Text style={styles.errorText}> - {errors.email.message}</Text>}
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="contact@example.com"
                  placeholderTextColor={MyCrewColors.placeholderText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />
          </View>
        </View>

        {/* Lieux de travail */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lieux de travail</Text>
            <TouchableOpacity style={styles.addButton} onPress={addLocation}>
              <Ionicons name="add" size={20} color={MyCrewColors.accent} />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </TouchableOpacity>
          </View>
          
          {locations.map((location, index) => (
            <View key={index} style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationTitle}>
                  Lieu {index + 1}
                  {index === 0 && <Text style={styles.primaryLabel}> (Principal)</Text>}
                </Text>
                <View style={styles.locationActions}>
                  {locations.length > 1 && (
                    <TouchableOpacity onPress={() => removeLocation(index)} style={styles.removeButton}>
                      <Ionicons name="trash-outline" size={16} color={MyCrewColors.destructive} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              <View style={styles.locationInputs}>
                <View style={styles.inputRow}>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Pays</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={location.country}
                      onChangeText={(text) => updateLocation(index, 'country', text)}
                      placeholder="France"
                      placeholderTextColor={MyCrewColors.placeholderText}
                    />
                  </View>
                  <View style={styles.inputHalf}>
                    <Text style={styles.inputLabel}>Région</Text>
                    <TextInput
                      style={styles.smallInput}
                      value={location.region}
                      onChangeText={(text) => updateLocation(index, 'region', text)}
                      placeholder="Île-de-France"
                      placeholderTextColor={MyCrewColors.placeholderText}
                    />
                  </View>
                </View>
                
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => updateLocation(index, 'isLocalResident', !location.isLocalResident)}
                  >
                    <Ionicons
                      name={location.isLocalResident ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={location.isLocalResident ? MyCrewColors.accent : MyCrewColors.iconMuted}
                    />
                    <Text style={styles.checkboxLabel}>Résident fiscal</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => updateLocation(index, 'hasVehicle', !location.hasVehicle)}
                  >
                    <Ionicons
                      name={location.hasVehicle ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={location.hasVehicle ? MyCrewColors.accent : MyCrewColors.iconMuted}
                    />
                    <Text style={styles.checkboxLabel}>Véhicule</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => updateLocation(index, 'isHoused', !location.isHoused)}
                  >
                    <Ionicons
                      name={location.isHoused ? 'checkbox' : 'square-outline'}
                      size={20}
                      color={location.isHoused ? MyCrewColors.accent : MyCrewColors.iconMuted}
                    />
                    <Text style={styles.checkboxLabel}>Logé sur place</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Bouton de sauvegarde */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Sauvegarde...</Text>
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color={MyCrewColors.background} />
                <Text style={styles.submitButtonText}>Sauvegarder le profil</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <JobPicker />
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: MyCrewColors.cardBackground,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.body,
    fontWeight: '500',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  errorText: {
    color: MyCrewColors.destructive,
    fontSize: Typography.small,
  },
  input: {
    borderWidth: 1,
    borderColor: MyCrewColors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    backgroundColor: MyCrewColors.background,
  },
  inputError: {
    borderColor: MyCrewColors.destructive,
  },
  inputText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    flex: 1,
  },
  placeholder: {
    color: MyCrewColors.placeholderText,
  },
  pickerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  addButtonText: {
    color: MyCrewColors.accent,
    fontSize: Typography.body,
    fontWeight: '500',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '500',
    color: MyCrewColors.textPrimary,
  },
  primaryLabel: {
    color: MyCrewColors.accent,
    fontSize: Typography.small,
  },
  locationActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  locationInputs: {
    gap: Spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: Typography.small,
    fontWeight: '500',
    color: MyCrewColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: MyCrewColors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    backgroundColor: MyCrewColors.cardBackground,
  },
  checkboxGroup: {
    gap: Spacing.sm,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkboxLabel: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
  actionsSection: {
    margin: Spacing.lg,
    gap: Spacing.lg,
  },
  submitButton: {
    backgroundColor: MyCrewColors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: MyCrewColors.background,
    fontSize: Typography.subheadline,
    fontWeight: '600',
  },
  jobPickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: MyCrewColors.background,
    zIndex: 1000,
  },
  jobPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  jobPickerTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  jobsList: {
    flex: 1,
    padding: Spacing.lg,
  },
  department: {
    marginBottom: Spacing.xl,
  },
  departmentTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.accent,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.accentLight,
  },
  jobItem: {
    backgroundColor: MyCrewColors.cardBackground,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  jobText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
});