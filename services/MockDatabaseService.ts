// MyCrew React Native - Mock Database Service for Web Platform
// This service provides the same API as DatabaseService but stores data in memory/localStorage

import { Contact, WorkLocation, UserProfile } from '../types';

export class MockDatabaseService {
  private static instance: MockDatabaseService;
  private contacts: Contact[] = [];
  private userProfile: UserProfile | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): MockDatabaseService {
    if (!MockDatabaseService.instance) {
      MockDatabaseService.instance = new MockDatabaseService();
    }
    return MockDatabaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load data from localStorage if available
      const contactsData = localStorage.getItem('mycrew_contacts');
      if (contactsData) {
        this.contacts = JSON.parse(contactsData);
      }

      const profileData = localStorage.getItem('mycrew_profile');
      if (profileData) {
        this.userProfile = JSON.parse(profileData);
      }

      this.initialized = true;
      console.log('Mock Database initialized successfully (Web Platform)');
    } catch (error) {
      console.error('Mock Database initialization failed:', error);
      this.contacts = [];
      this.userProfile = null;
      this.initialized = true;
    }
  }

  async resetDatabase(): Promise<void> {
    this.contacts = [];
    this.userProfile = null;
    localStorage.removeItem('mycrew_contacts');
    localStorage.removeItem('mycrew_profile');
    console.log('Mock Database reset successfully');
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('mycrew_contacts', JSON.stringify(this.contacts));
      if (this.userProfile) {
        localStorage.setItem('mycrew_profile', JSON.stringify(this.userProfile));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  // Contact CRUD operations
  async createContact(contact: Omit<Contact, 'id'>): Promise<string> {
    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add locations with IDs
    const locations: WorkLocation[] = contact.locations.map(loc => ({
      ...loc,
      id: `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    const newContact: Contact = {
      ...contact,
      id: contactId,
      locations,
      city: locations.find(loc => loc.isPrimary)?.region || locations[0]?.country,
      primaryLocation: locations.find(loc => loc.isPrimary),
      secondaryLocations: locations.filter(loc => !loc.isPrimary)
    };

    this.contacts.push(newContact);
    this.saveToStorage();
    
    return contactId;
  }

  async getContact(contactId: string): Promise<Contact | null> {
    return this.contacts.find(contact => contact.id === contactId) || null;
  }

  async getAllContacts(): Promise<Contact[]> {
    return [...this.contacts].sort((a, b) => {
      const aName = `${a.lastName} ${a.firstName}`;
      const bName = `${b.lastName} ${b.firstName}`;
      return aName.localeCompare(bName);
    });
  }

  async updateContact(contactId: string, contactUpdate: Omit<Contact, 'id'>): Promise<void> {
    const index = this.contacts.findIndex(contact => contact.id === contactId);
    
    if (index === -1) {
      throw new Error(`Contact with id ${contactId} not found`);
    }

    // Add locations with IDs
    const locations: WorkLocation[] = contactUpdate.locations.map(loc => ({
      ...loc,
      id: loc.id || `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    const updatedContact: Contact = {
      ...contactUpdate,
      id: contactId,
      locations,
      city: locations.find(loc => loc.isPrimary)?.region || locations[0]?.country,
      primaryLocation: locations.find(loc => loc.isPrimary),
      secondaryLocations: locations.filter(loc => !loc.isPrimary)
    };

    this.contacts[index] = updatedContact;
    this.saveToStorage();
  }

  async deleteContact(contactId: string): Promise<void> {
    this.contacts = this.contacts.filter(contact => contact.id !== contactId);
    this.saveToStorage();
  }

  async searchContacts(query: string): Promise<Contact[]> {
    if (!query.trim()) {
      return this.getAllContacts();
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.contacts.filter(contact => {
      const searchableText = [
        contact.firstName,
        contact.lastName,
        contact.jobTitle,
        ...(contact.jobTitles || []),
        contact.phone,
        contact.email,
        contact.notes
      ].join(' ').toLowerCase();
      
      return searchableText.includes(searchTerm);
    }).sort((a, b) => {
      const aName = `${a.lastName} ${a.firstName}`;
      const bName = `${b.lastName} ${b.firstName}`;
      return aName.localeCompare(bName);
    });
  }

  async findContactByNameAndPhone(fullName: string, phone: string): Promise<Contact | null> {
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
    // Add locations with IDs
    const locations: WorkLocation[] = profile.locations.map(loc => ({
      ...loc,
      id: loc.id || `profile_location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));

    this.userProfile = {
      ...profile,
      locations
    };
    
    this.saveToStorage();
  }

  async getContactCount(): Promise<number> {
    return this.contacts.length;
  }

  async clearAllContacts(): Promise<void> {
    this.contacts = [];
    this.saveToStorage();
    console.log('All contacts cleared successfully (Mock)');
  }

  async getFavoriteContacts(): Promise<Contact[]> {
    return this.contacts
      .filter(contact => contact.isFavorite)
      .sort((a, b) => {
        const aName = `${a.lastName} ${a.firstName}`;
        const bName = `${b.lastName} ${b.firstName}`;
        return aName.localeCompare(bName);
      });
  }
}