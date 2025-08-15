// MyCrew React Native - AsyncStorage Service
// Cross-platform storage using AsyncStorage for web compatibility

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contact, WorkLocation, UserProfile, getContactFullName } from '../types';
import { IDatabaseService } from './DatabaseServiceFactory';

const STORAGE_KEYS = {
  CONTACTS: 'mycrew_contacts',
  USER_PROFILE: 'mycrew_user_profile',
  INIT_FLAG: 'mycrew_initialized'
};

export class AsyncStorageService implements IDatabaseService {
  private static instance: AsyncStorageService;
  private contacts: Contact[] = [];
  private userProfile: UserProfile | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): AsyncStorageService {
    if (!AsyncStorageService.instance) {
      AsyncStorageService.instance = new AsyncStorageService();
    }
    return AsyncStorageService.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Load existing data from storage
      await this.loadContacts();
      await this.loadUserProfile();
      
      // Mark as initialized
      await AsyncStorage.setItem(STORAGE_KEYS.INIT_FLAG, 'true');
      this.initialized = true;
      
      console.log('AsyncStorage service initialized successfully');
    } catch (error) {
      console.error('AsyncStorage initialization failed:', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.CONTACTS,
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.INIT_FLAG
      ]);
      
      this.contacts = [];
      this.userProfile = null;
      this.initialized = false;
      
      console.log('AsyncStorage database reset successfully');
    } catch (error) {
      console.error('AsyncStorage reset failed:', error);
      throw error;
    }
  }

  private async loadContacts(): Promise<void> {
    try {
      const contactsJson = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (contactsJson) {
        this.contacts = JSON.parse(contactsJson);
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
      this.contacts = [];
    }
  }

  private async saveContacts(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.contacts));
    } catch (error) {
      console.error('Failed to save contacts:', error);
      throw error;
    }
  }

  private async loadUserProfile(): Promise<void> {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileJson) {
        this.userProfile = JSON.parse(profileJson);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      this.userProfile = null;
    }
  }

  private async saveUserProfile(): Promise<void> {
    try {
      if (this.userProfile) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(this.userProfile));
      }
    } catch (error) {
      console.error('Failed to save user profile:', error);
      throw error;
    }
  }

  // Contact CRUD operations
  async createContact(contact: Omit<Contact, 'id'>): Promise<string> {
    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newContact: Contact = {
      id: contactId,
      ...contact
    };

    this.contacts.push(newContact);
    await this.saveContacts();
    
    return contactId;
  }

  async getContact(contactId: string): Promise<Contact | null> {
    return this.contacts.find(contact => contact.id === contactId) || null;
  }

  async getAllContacts(): Promise<Contact[]> {
    // Sort by lastName, then firstName
    return [...this.contacts].sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  }

  async updateContact(contactId: string, contact: Omit<Contact, 'id'>): Promise<void> {
    const index = this.contacts.findIndex(c => c.id === contactId);
    if (index === -1) {
      throw new Error(`Contact with id ${contactId} not found`);
    }

    this.contacts[index] = {
      id: contactId,
      ...contact
    };

    await this.saveContacts();
  }

  async deleteContact(contactId: string): Promise<void> {
    const index = this.contacts.findIndex(c => c.id === contactId);
    if (index === -1) {
      throw new Error(`Contact with id ${contactId} not found`);
    }

    this.contacts.splice(index, 1);
    await this.saveContacts();
  }

  async searchContacts(query: string): Promise<Contact[]> {
    if (!query.trim()) return this.getAllContacts();

    const searchTerm = query.trim().toLowerCase();
    
    const filtered = this.contacts.filter(contact => {
      const fullName = getContactFullName(contact).toLowerCase();
      const jobTitles = contact.jobTitles?.join(' ').toLowerCase() || '';
      const jobTitle = contact.jobTitle?.toLowerCase() || '';
      
      return fullName.includes(searchTerm) ||
             contact.firstName.toLowerCase().includes(searchTerm) ||
             contact.lastName.toLowerCase().includes(searchTerm) ||
             jobTitle.includes(searchTerm) ||
             jobTitles.includes(searchTerm) ||
             contact.phone.includes(searchTerm) ||
             contact.email.toLowerCase().includes(searchTerm) ||
             (contact.notes && contact.notes.toLowerCase().includes(searchTerm));
    });

    // Sort results
    return filtered.sort((a, b) => {
      const lastNameCompare = a.lastName.localeCompare(b.lastName);
      if (lastNameCompare !== 0) return lastNameCompare;
      return a.firstName.localeCompare(b.firstName);
    });
  }

  async findContactByNameAndPhone(fullName: string, phone: string): Promise<Contact | null> {
    // Try to parse the full name
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    return this.contacts.find(contact => 
      contact.firstName === firstName && 
      contact.lastName === lastName && 
      contact.phone === phone
    ) || null;
  }

  // User Profile operations
  async getUserProfile(): Promise<UserProfile | null> {
    return this.userProfile;
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    this.userProfile = { ...profile };
    await this.saveUserProfile();
  }

  // Utility methods
  async getContactCount(): Promise<number> {
    return this.contacts.length;
  }

  async clearAllContacts(): Promise<void> {
    this.contacts = [];
    await this.saveContacts();
    console.log('All contacts cleared successfully');
  }

  async getFavoriteContacts(): Promise<Contact[]> {
    const favorites = this.contacts.filter(contact => contact.isFavorite);
    
    // Sort favorites by name
    return favorites.sort((a, b) => {
      const nameA = getContactFullName(a);
      const nameB = getContactFullName(b);
      return nameA.localeCompare(nameB);
    });
  }

  // Check if database has been initialized (for seeding)
  async isInitialized(): Promise<boolean> {
    try {
      const flag = await AsyncStorage.getItem(STORAGE_KEYS.INIT_FLAG);
      return flag === 'true';
    } catch {
      return false;
    }
  }
}