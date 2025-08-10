// MyCrew React Native - TypeScript Data Models
// Based on Swift app analysis - complete data structure definitions

export interface WorkLocation {
  id: string;
  country: string;
  region?: string;
  isLocalResident: boolean;
  hasVehicle: boolean;
  isHoused: boolean;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  jobTitles: string[]; // Changed to array, max 3 jobs
  phone: string;
  email: string;
  notes: string;
  isFavorite: boolean;
  locations: WorkLocation[];
  // Computed properties (will be calculated)
  city?: string;
  primaryLocation?: WorkLocation;
  secondaryLocations?: WorkLocation[];
  // Legacy field for migration
  jobTitle?: string;
}

export interface Location {
  id: string;
  country: string;
  region: string;
  isLocalResident: boolean;
  hasVehicle: boolean;
  isHoused: boolean;
  isPrimary: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  jobTitles: string[]; // Changed to array, max 3 jobs
  phoneNumber: string;
  email: string;
  locations: Location[];
  isFavorite: boolean;
  // Legacy field for migration
  jobTitle?: string;
}

// QR Code data structure
export interface QRContactData {
  type: string; // "MyCrew_Contact"
  version: string; // "1.0"
  data: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    phone: string;
    email: string;
    notes: string;
    locations: Omit<WorkLocation, 'id'>[];
  };
}

// Filter settings for contact filtering
export interface FilterSettings {
  selectedJob: string; // "Tous" for all
  selectedCountry: string; // "Tous" for all
  selectedRegions: Set<string>;
  includeVehicle: boolean;
  includeHoused: boolean;
  includeResident: boolean;
}

// Database result types
export interface ContactRow {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  jobTitles?: string | null; // JSON string representation
  phone: string;
  email: string;
  notes: string;
  isFavorite: number; // SQLite uses 0/1 for boolean
}

export interface WorkLocationRow {
  id: string;
  contactId: string;
  country: string;
  region?: string;
  isLocalResident: number; // SQLite uses 0/1 for boolean
  hasVehicle: number;
  isHoused: number;
  isPrimary: number;
}

// Department structure for job titles
export interface Department {
  name: string;
  jobs: string[];
}

// Export/Import formats
export interface ExportContact {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  email: string;
  notes: string;
  isFavorite: boolean;
  locations: Array<{
    country: string;
    region?: string;
    isLocalResident: boolean;
    hasVehicle: boolean;
    isHoused: boolean;
    isPrimary: boolean;
  }>;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates: number;
}

// Navigation types
export type RootStackParamList = {
  Contacts: undefined;
  ContactDetail: { contactId: string };
  AddContact: undefined;
  EditContact: { contactId: string };
  QRScanner: undefined;
  QRCodeDisplay: {
    contact?: Contact;
    profile?: UserProfile;
    qrData?: string;
    title?: string;
    subtitle?: string;
    isMultiContact?: boolean;
    contactCount?: number;
  };
  MultiQRExport: {
    filters?: {
      job: string | null;
      country: string | null;
      regions: string[];
      isHoused: boolean;
      isLocalResident: boolean;
      hasVehicle: boolean;
    };
    searchText?: string;
  };
  Profile: undefined;
  UserProfileEditor: undefined;
  Settings: undefined;
  ExportOptions: undefined;
  ImportOptions: undefined;
};

// Form validation types
export interface ContactFormData {
  firstName: string;
  lastName: string;
  jobTitles: string[]; // Changed to array, max 3 jobs
  phone: string;
  email: string;
  notes: string;
  isFavorite: boolean;
  locations: Omit<WorkLocation, 'id'>[];
  // Legacy field for forms that still use single job
  jobTitle?: string;
}

export interface ContactFormErrors {
  firstName?: string;
  lastName?: string;
  jobTitles?: string;
  phone?: string;
  email?: string;
  locations?: string;
  // Legacy field for forms that still use single job
  jobTitle?: string;
}

// Search and highlighting
export interface SearchHighlight {
  text: string;
  isHighlighted: boolean;
}

// Application state
export interface AppState {
  contacts: Contact[];
  userProfile?: UserProfile;
  filters: FilterSettings;
  searchText: string;
  isLoading: boolean;
  lastSync?: Date;
}

// Helper functions
export const getFullName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

export const getContactFullName = (contact: Contact): string => {
  return getFullName(contact.firstName, contact.lastName);
};

export const getUserProfileFullName = (profile: UserProfile): string => {
  return getFullName(profile.firstName, profile.lastName);
};

export const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 0) {
    return { firstName: '', lastName: '' };
  } else if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  } else {
    return { 
      firstName: parts[0], 
      lastName: parts.slice(1).join(' ') 
    };
  }
};