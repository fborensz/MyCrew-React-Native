// MyCrew React Native - Add Contact Screen
// Formulaire complet pour ajouter un nouveau contact

import React, { useState } from 'react';
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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';

import { MyCrewColors } from '../constants/Colors';
import { contactValidationSchema } from '../utils/validation';
import { JobTitles } from '../data/JobTitles';
import { COUNTRIES_WITH_REGIONS } from '../data/Locations';
import { DatabaseService, WorkLocation } from '../services/DatabaseService';
import { ContactFormData } from '../types';

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

export default function AddContactScreen() {
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [showJobPicker, setShowJobPicker] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState<{show: boolean, locationIndex: number}>({show: false, locationIndex: -1});
  const [showRegionPicker, setShowRegionPicker] = useState<{show: boolean, locationIndex: number}>({show: false, locationIndex: -1});
  const [locations, setLocations] = useState<Omit<WorkLocation, 'id'>[]>([
    {
      country: 'France',
      region: 'Île-de-France',
      isLocalResident: true,
      hasVehicle: false,
      isHoused: false,
      isPrimary: true,
    },
  ]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: yupResolver(contactValidationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      jobTitle: '',
      phone: '',
      email: '',
      notes: '',
      isFavorite: false,
      locations: locations,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const db = DatabaseService.getInstance();
      await db.createContact({
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
        isFavorite: data.isFavorite,
        locations: data.locations,
      });
      
      Alert.alert(
        'Contact créé',
        `${data.firstName} ${data.lastName} a été ajouté à vos contacts.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Erreur création contact:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer le contact. Vérifiez vos données.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const addLocation = () => {
    const newLocation: Omit<WorkLocation, 'id'> = {
      country: 'France',
      region: 'Île-de-France', 
      isLocalResident: false,
      hasVehicle: false,
      isHoused: false,
      isPrimary: false,
    };
    
    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    setValue('locations', updatedLocations);
  };

  const removeLocation = (index: number) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
    setValue('locations', updatedLocations);
  };

  const toggleLocationPrimary = (index: number) => {
    const updatedLocations = locations.map((loc, i) => ({
      ...loc,
      isPrimary: i === index ? !loc.isPrimary : false, // Une seule localisation primaire
    }));
    setLocations(updatedLocations);
    setValue('locations', updatedLocations);
  };

  const updateLocation = (index: number, field: keyof Omit<WorkLocation, 'id'>, value: any) => {
    const updatedLocations = locations.map((loc, i) =>
      i === index ? { ...loc, [field]: value } : loc
    );
    setLocations(updatedLocations);
    setValue('locations', updatedLocations);
  };

  const hasLocationStatus = (location: Omit<WorkLocation, 'id'>) => {
    return location.isLocalResident || location.hasVehicle || location.isHoused;
  };

  const JobPicker = () => {
    if (!showJobPicker) return null;

    if (!selectedDepartment) {
      // Show department selection
      return (
        <View style={styles.jobPickerContainer}>
          <View style={styles.jobPickerHeader}>
            <Text style={styles.jobPickerTitle}>Choisir une catégorie</Text>
            <TouchableOpacity onPress={() => {
              setShowJobPicker(false);
              setSelectedDepartment(null);
            }}>
              <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.departmentsList}>
            {Object.keys(JobTitles.departments).sort().filter(d => d !== 'Autres Spécialités')
              .concat(Object.keys(JobTitles.departments).filter(d => d === 'Autres Spécialités'))
              .map((department) => (
              <TouchableOpacity
                key={department}
                style={styles.departmentCard}
                onPress={() => setSelectedDepartment(department)}
              >
                <View style={styles.departmentIcon}>
                  <Ionicons 
                    name={JobTitles.getIconForDepartment(department) as any} 
                    size={20} 
                    color={MyCrewColors.accent} 
                  />
                </View>
                <Text style={styles.departmentName}>{department}</Text>
                <Ionicons name="chevron-forward" size={20} color={MyCrewColors.iconMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    // Show jobs for selected department
    const departmentJobs = JobTitles.getJobsForDepartment(selectedDepartment);
    
    return (
      <View style={styles.jobPickerContainer}>
        <View style={styles.jobPickerHeader}>
          <TouchableOpacity 
            onPress={() => setSelectedDepartment(null)}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={MyCrewColors.accent} />
          </TouchableOpacity>
          <Text style={styles.jobPickerTitle}>{selectedDepartment}</Text>
          <TouchableOpacity onPress={() => {
            setShowJobPicker(false);
            setSelectedDepartment(null);
          }}>
            <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.jobsList}>
          {departmentJobs.map((job) => (
            <TouchableOpacity
              key={job}
              style={styles.jobItem}
              onPress={() => {
                setValue('jobTitle', job);
                setShowJobPicker(false);
                setSelectedDepartment(null);
              }}
            >
              <Text style={styles.jobText}>{job}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Navigation et Favori */}
        <View style={styles.topActionsSection}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={MyCrewColors.textPrimary} />
          </TouchableOpacity>
          
          <Controller
            control={control}
            name="isFavorite"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                onPress={() => onChange(!value)}
                style={styles.favoriteButton}
              >
                <Ionicons
                  name={value ? 'star' : 'star-outline'}
                  size={24}
                  color={value ? '#FFD700' : MyCrewColors.iconMuted}
                />
                <Text style={styles.favoriteText}>Favori</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      
        {/* Informations de base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={styles.label}>
                Prénom *
                {errors.firstName && <Text style={styles.errorText}> - {errors.firstName.message}</Text>}
              </Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Prénom"
                    placeholderTextColor={MyCrewColors.placeholderText}
                  />
                )}
              />
            </View>
            
            <View style={styles.inputHalf}>
              <Text style={styles.label}>
                Nom *
                {errors.lastName && <Text style={styles.errorText}> - {errors.lastName.message}</Text>}
              </Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Nom"
                    placeholderTextColor={MyCrewColors.placeholderText}
                  />
                )}
              />
            </View>
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
              <Ionicons name="chevron-forward" size={20} color={MyCrewColors.iconMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Téléphone
              {errors.phone && <Text style={styles.errorText}> - {errors.phone.message}</Text>}
            </Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
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
              Email
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Notes, compétences particulières..."
                  placeholderTextColor={MyCrewColors.placeholderText}
                  multiline
                  numberOfLines={3}
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
                  {location.isPrimary && <Text style={styles.primaryLabel}> (Principal)</Text>}
                </Text>
                <View style={styles.locationActions}>
                  <TouchableOpacity
                    onPress={() => toggleLocationPrimary(index)}
                    style={styles.primaryButton}
                  >
                    <Ionicons 
                      name={location.isPrimary ? 'star' : 'star-outline'} 
                      size={16} 
                      color={location.isPrimary ? MyCrewColors.accent : MyCrewColors.iconMuted} 
                    />
                  </TouchableOpacity>
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
                    <TouchableOpacity
                      style={styles.smallPicker}
                      onPress={() => setShowCountryPicker({show: true, locationIndex: index})}
                    >
                      <Text style={[styles.smallPickerText, !location.country && styles.placeholder]}>
                        {location.country || 'Choisir un pays'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={MyCrewColors.iconMuted} />
                    </TouchableOpacity>
                  </View>
                  {location.country === 'France' && (
                    <View style={styles.inputHalf}>
                      <Text style={styles.inputLabel}>Région</Text>
                      <TouchableOpacity
                        style={styles.smallPicker}
                        onPress={() => setShowRegionPicker({show: true, locationIndex: index})}
                      >
                        <Text style={[
                          styles.smallPickerText, 
                          !location.region && styles.placeholder
                        ]}>
                          {location.region || 'Choisir une région'}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={MyCrewColors.iconMuted} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => updateLocation(index, 'isLocalResident', !location.isLocalResident)}
                  >
                    <Ionicons
                      name={location.isLocalResident ? 'checkbox' : 'checkbox-outline'}
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
                      name={location.hasVehicle ? 'checkbox' : 'checkbox-outline'}
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
                      name={location.isHoused ? 'checkbox' : 'checkbox-outline'}
                      size={20}
                      color={location.isHoused ? MyCrewColors.accent : MyCrewColors.iconMuted}
                    />
                    <Text style={styles.checkboxLabel}>Logé sur place</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Message d'erreur si aucun statut n'est sélectionné */}
                {!hasLocationStatus(location) && (
                  <Text style={styles.locationStatusError}>
                    Au moins une option doit être sélectionnée (résidence fiscale, véhicule ou logé)
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Bouton d'action */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Création...</Text>
            ) : (
              <>
                <Ionicons name="person-add" size={20} color={MyCrewColors.background} />
                <Text style={styles.submitButtonText}>Créer le contact</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <JobPicker />
      
      {/* Country Picker Modal */}
      {showCountryPicker.show && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choisir un pays</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker({show: false, locationIndex: -1})}>
              <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {Object.keys(COUNTRIES_WITH_REGIONS).map((country) => (
              <TouchableOpacity
                key={country}
                style={styles.pickerItem}
                onPress={() => {
                  const index = showCountryPicker.locationIndex;
                  // Mettre à jour le pays et vider la région si ce n'est pas la France
                  const updatedLocations = locations.map((loc, i) =>
                    i === index ? { 
                      ...loc, 
                      country: country,
                      region: country === 'France' ? loc.region : '' // Vider la région si ce n'est pas la France
                    } : loc
                  );
                  setLocations(updatedLocations);
                  setValue('locations', updatedLocations);
                  setShowCountryPicker({show: false, locationIndex: -1});
                }}
              >
                <Text style={styles.pickerItemText}>{country}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Region Picker Modal */}
      {showRegionPicker.show && showRegionPicker.locationIndex >= 0 && (
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Choisir une région</Text>
            <TouchableOpacity onPress={() => setShowRegionPicker({show: false, locationIndex: -1})}>
              <Ionicons name="close" size={24} color={MyCrewColors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.pickerList}>
            {locations[showRegionPicker.locationIndex]?.country && 
             COUNTRIES_WITH_REGIONS[locations[showRegionPicker.locationIndex].country]?.map((region) => (
              <TouchableOpacity
                key={region}
                style={styles.pickerItem}
                onPress={() => {
                  updateLocation(showRegionPicker.locationIndex, 'region', region);
                  setShowRegionPicker({show: false, locationIndex: -1});
                }}
              >
                <Text style={styles.pickerItemText}>{region}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  topActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  favoriteText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    fontWeight: '500',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
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
  primaryButton: {
    padding: Spacing.xs,
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
  locationStatusError: {
    fontSize: Typography.small,
    color: MyCrewColors.destructive,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
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
  
  // New styles for department selection
  departmentsList: {
    flex: 1,
    padding: Spacing.lg,
  },
  departmentCard: {
    backgroundColor: MyCrewColors.cardBackground,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.small,
  },
  departmentIcon: {
    width: 36,
    height: 36,
    backgroundColor: `${MyCrewColors.accent}15`,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  departmentName: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '500',
    color: MyCrewColors.textPrimary,
  },
  backButton: {
    padding: Spacing.xs,
  },
  
  // Location picker styles
  smallPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: MyCrewColors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    backgroundColor: MyCrewColors.cardBackground,
  },
  smallPickerText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
    flex: 1,
  },
  disabled: {
    color: MyCrewColors.iconMuted,
  },
  
  // General picker container
  pickerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: MyCrewColors.background,
    zIndex: 1000,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  pickerTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  pickerList: {
    flex: 1,
    padding: Spacing.lg,
  },
  pickerItem: {
    backgroundColor: MyCrewColors.cardBackground,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  pickerItemText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
});