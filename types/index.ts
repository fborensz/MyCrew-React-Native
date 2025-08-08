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
  name: string;
  jobTitle: string;
  phone: string;
  email: string;
  notes: string;
  isFavorite: boolean;
  locations: WorkLocation[];
  // Computed properties (will be calculated)
  city?: string;
  primaryLocation?: WorkLocation;
  secondaryLocations?: WorkLocation[];
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
  name: string; // Prénom + Nom dans un seul champ
  jobTitle: string;
  phoneNumber: string;
  email: string;
  locations: Location[];
  isFavorite: boolean;
}

// QR Code data structure
export interface QRContactData {
  type: string; // "MyCrew_Contact"
  version: string; // "1.0"
  data: {
    name: string;
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
  name: string;
  jobTitle: string;
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
  name: string;
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
  MainTabs: undefined;
  ContactDetail: { contactId: string };
  AddContact: undefined;
  EditContact: { contactId: string };
  QRScanner: undefined;
  QRCodeDisplay: {
    contact?: Contact;
    profile?: UserProfile;
    qrData?: any;
  };
  UserProfileEditor: undefined;
};

export type TabParamList = {
  Contacts: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Form validation types
export interface ContactFormData {
  name: string;
  jobTitle: string;
  phone: string;
  email: string;
  notes: string;
  isFavorite: boolean;
  locations: Omit<WorkLocation, 'id'>[];
}

export interface ContactFormErrors {
  name?: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  locations?: string;
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