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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Ionicons } from '@expo/vector-icons';

import { MyCrewColors } from '../constants/Colors';
import { contactValidationSchema } from '../utils/validation';
import { FILM_DEPARTMENTS } from '../data/JobTitles';
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
      name: '',
      jobTitle: '',
      phone: '',
      email: '',
      notes: '',
      isFavorite: false,
      locations: locations,
    },
  });

  const allJobs = FILM_DEPARTMENTS.flatMap(dept => dept.jobs);

  const onSubmit = async (data: ContactFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const db = DatabaseService.getInstance();
      await db.createContact({
        name: data.name,
        jobTitle: data.jobTitle,
        phone: data.phone,
        email: data.email,
        notes: data.notes,
        isFavorite: data.isFavorite,
        locations: data.locations,
      });
      
      Alert.alert(
        'Contact créé',
        `${data.name} a été ajouté à vos contacts.`,
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Informations de base */}
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
              </View>
            </View>
          ))}
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsSection}>
          <Controller
            control={control}
            name="isFavorite"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={styles.favoriteToggle}
                onPress={() => onChange(!value)}
              >
                <Ionicons
                  name={value ? 'star' : 'star-outline'}
                  size={20}
                  color={value ? MyCrewColors.accent : MyCrewColors.iconMuted}
                />
                <Text style={[styles.favoriteText, value && styles.favoriteTextActive]}>
                  {value ? 'Contact favori' : 'Ajouter aux favoris'}
                </Text>
              </TouchableOpacity>
            )}
          />

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
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
  actionsSection: {
    margin: Spacing.lg,
    gap: Spacing.lg,
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadows.small,
  },
  favoriteText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    fontWeight: '500',
  },
  favoriteTextActive: {
    color: MyCrewColors.accent,
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