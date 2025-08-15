// MyCrew React Native - Database Service Factory
// Conditionally loads the appropriate database service based on platform

import { Platform } from 'react-native';
import { AsyncStorageService } from './AsyncStorageService';

// Interface that both services must implement
export interface IDatabaseService {
  initialize(): Promise<void>;
  resetDatabase(): Promise<void>;
  createContact(contact: any): Promise<string>;
  getContact(contactId: string): Promise<any>;
  getAllContacts(): Promise<any[]>;
  updateContact(contactId: string, contact: any): Promise<void>;
  deleteContact(contactId: string): Promise<void>;
  searchContacts(query: string): Promise<any[]>;
  findContactByNameAndPhone(fullName: string, phone: string): Promise<any>;
  getUserProfile(): Promise<any>;
  saveUserProfile(profile: any): Promise<void>;
  getContactCount(): Promise<number>;
  clearAllContacts(): Promise<void>;
  getFavoriteContacts(): Promise<any[]>;
}

export class DatabaseServiceFactory {
  private static instance: IDatabaseService | null = null;

  static async getInstance(): Promise<IDatabaseService> {
    if (this.instance) {
      return this.instance;
    }

    if (Platform.OS === 'web') {
      // Use AsyncStorage service for web
      this.instance = AsyncStorageService.getInstance();
    } else {
      // Use real SQLite service for mobile platforms
      const { DatabaseService } = require('./DatabaseService');
      this.instance = DatabaseService.getInstance();
    }

    await this.instance.initialize();
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}