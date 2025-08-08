import * as yup from 'yup';

// Schémas de validation pour les formulaires MyCrew

export const contactValidationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Le prénom est obligatoire')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  
  lastName: yup
    .string()
    .required('Le nom est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  jobTitle: yup
    .string()
    .required('Le métier est obligatoire')
    .min(2, 'Le métier doit contenir au moins 2 caractères')
    .max(100, 'Le métier ne peut pas dépasser 100 caractères'),
  
  phone: yup
    .string()
    .required('Le téléphone est obligatoire')
    .matches(
      /^[\+]?[0-9\s\-\(\)\.]{8,20}$/,
      'Numéro de téléphone invalide'
    ),
  
  email: yup
    .string()
    .required('L\'email est obligatoire')
    .email('Adresse email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  
  notes: yup
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères'),
  
  isFavorite: yup
    .boolean(),
  
  locations: yup
    .array()
    .of(
      yup.object().shape({
        country: yup
          .string()
          .required('Le pays est obligatoire'),
        
        region: yup
          .string()
          .nullable(),
        
        isLocalResident: yup
          .boolean()
          .required(),
        
        hasVehicle: yup
          .boolean()
          .required(),
        
        isHoused: yup
          .boolean()
          .required(),
        
        isPrimary: yup
          .boolean()
          .required(),
      })
    )
    .min(1, 'Au moins une localisation est requise')
    .test(
      'unique-primary',
      'Une seule localisation peut être principale',
      (locations) => {
        if (!locations) return true;
        const primaryCount = locations.filter((loc: any) => loc.isPrimary).length;
        return primaryCount <= 1;
      }
    ),
});

export const userProfileValidationSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Le prénom est obligatoire')
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
  
  lastName: yup
    .string()
    .required('Le nom est obligatoire')
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  
  jobTitle: yup
    .string()
    .required('Le métier est obligatoire')
    .min(2, 'Le métier doit contenir au moins 2 caractères')
    .max(100, 'Le métier ne peut pas dépasser 100 caractères'),
  
  phoneNumber: yup
    .string()
    .required('Le téléphone est obligatoire')
    .matches(
      /^[\+]?[0-9\s\-\(\)\.]{8,20}$/,
      'Numéro de téléphone invalide'
    ),
  
  email: yup
    .string()
    .required('L\'email est obligatoire')
    .email('Adresse email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères'),
  
  locations: yup
    .array()
    .of(
      yup.object().shape({
        country: yup.string().required('Le pays est obligatoire'),
        region: yup.string().nullable(),
        isLocalResident: yup.boolean().required(),
        hasVehicle: yup.boolean().required(),
        isHoused: yup.boolean().required(),
        isPrimary: yup.boolean().required(),
      })
    )
    .min(1, 'Au moins une localisation est requise')
    .test(
      'unique-primary',
      'Une seule localisation peut être principale',
      (locations) => {
        if (!locations) return true;
        const primaryCount = locations.filter((loc: any) => loc.isPrimary).length;
        return primaryCount <= 1;
      }
    ),
});

// Validation pour les filtres
export const filterValidationSchema = yup.object().shape({
  selectedJob: yup
    .string()
    .required(),
  
  selectedCountry: yup
    .string()
    .required(),
  
  selectedRegions: yup
    .mixed(), // Set<string> - pas directement supporté par yup
  
  includeVehicle: yup
    .boolean()
    .required(),
  
  includeHoused: yup
    .boolean()
    .required(),
  
  includeResident: yup
    .boolean()
    .required(),
});

// Utilitaires de validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)\.]{8,20}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatPhoneNumber = (phone: string): string => {
  // Enlever tous les caractères non numériques sauf +
  const cleaned = phone.replace(/[^\d\+]/g, '');
  
  // Format français standard
  if (cleaned.startsWith('33')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+33${cleaned.substring(1)}`;
  }
  if (cleaned.length === 9) {
    return `+33${cleaned}`;
  }
  
  return phone; // Retourner tel quel si format non reconnu
};

export const formatEmailForDisplay = (email: string): string => {
  return email.toLowerCase().trim();
};

// Messages d'erreur personnalisés
export const ValidationMessages = {
  REQUIRED: 'Ce champ est obligatoire',
  NAME_TOO_SHORT: 'Le nom doit contenir au moins 2 caractères',
  NAME_TOO_LONG: 'Le nom ne peut pas dépasser 100 caractères',
  PHONE_INVALID: 'Numéro de téléphone invalide',
  EMAIL_INVALID: 'Adresse email invalide',
  EMAIL_TOO_LONG: 'L\'email ne peut pas dépasser 255 caractères',
  NOTES_TOO_LONG: 'Les notes ne peuvent pas dépasser 1000 caractères',
  LOCATION_REQUIRED: 'Au moins une localisation est requise',
  UNIQUE_PRIMARY_LOCATION: 'Une seule localisation peut être principale',
  JOB_TOO_SHORT: 'Le métier doit contenir au moins 2 caractères',
  JOB_TOO_LONG: 'Le métier ne peut pas dépasser 100 caractères',
};

// Helper pour extraire les erreurs de validation
export const extractValidationErrors = (error: yup.ValidationError): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (error.inner) {
    error.inner.forEach((err) => {
      if (err.path) {
        errors[err.path] = err.message;
      }
    });
  } else if (error.path) {
    errors[error.path] = error.message;
  }
  
  return errors;
};