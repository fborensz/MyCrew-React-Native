// MyCrew React Native - Database Service
// SQLite-based contact management with full CRUD operations

import * as SQLite from 'expo-sqlite';
import { Contact, WorkLocation, ContactRow, WorkLocationRow, UserProfile, getContactFullName } from '../types';

export class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('mycrew.db');
      await this.migrateDatabase();
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    try {
      await this.db.execAsync('DROP TABLE IF EXISTS work_locations');
      await this.db.execAsync('DROP TABLE IF EXISTS contacts');
      await this.db.execAsync('DROP TABLE IF EXISTS user_profile');
      await this.db.execAsync('DROP TABLE IF EXISTS user_profile_locations');
      
      await this.createTables();
      console.log('Database reset successfully');
    } catch (error) {
      console.error('Database reset failed:', error);
      throw error;
    }
  }

  private async migrateDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Vérifier si la table contacts existe
      const tableExists = await this.db.getFirstAsync<any>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='contacts'"
      );
      
      if (!tableExists) {
        console.log('Aucune table contacts existante, création de nouvelles tables');
        return; // Les tables seront créées par createTables()
      }
      
      // Vérifier si l'ancienne structure existe (avec colonne 'name')
      const tableInfo = await this.db.getAllAsync<any>("PRAGMA table_info(contacts)");
      const hasOldStructure = tableInfo.some((col: any) => col.name === 'name');
      const hasNewStructure = tableInfo.some((col: any) => col.name === 'firstName');

      if (hasOldStructure && !hasNewStructure) {
        console.log('Migration de la base de données: nom → prénom/nom');
        
        await this.db.withTransactionAsync(async () => {
          // Ajouter les nouvelles colonnes
          await this.db!.execAsync('ALTER TABLE contacts ADD COLUMN firstName TEXT DEFAULT ""');
          await this.db!.execAsync('ALTER TABLE contacts ADD COLUMN lastName TEXT DEFAULT ""');
          
          // Récupérer tous les contacts existants
          const contacts = await this.db!.getAllAsync<any>('SELECT id, name FROM contacts');
          
          // Migrer les données nom → prénom/nom
          for (const contact of contacts) {
            if (contact.name) {
              const parts = contact.name.trim().split(' ');
              const firstName = parts[0] || '';
              const lastName = parts.slice(1).join(' ') || '';
              
              await this.db!.runAsync(
                'UPDATE contacts SET firstName = ?, lastName = ? WHERE id = ?',
                [firstName, lastName, contact.id]
              );
            }
          }
          
          // Créer une nouvelle table temporaire avec la nouvelle structure
          await this.db!.execAsync(`
            CREATE TABLE contacts_new (
              id TEXT PRIMARY KEY,
              firstName TEXT NOT NULL DEFAULT '',
              lastName TEXT NOT NULL DEFAULT '',
              jobTitle TEXT NOT NULL DEFAULT '',
              phone TEXT NOT NULL DEFAULT '',
              email TEXT NOT NULL DEFAULT '',
              notes TEXT DEFAULT '',
              isFavorite INTEGER DEFAULT 0,
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );
          `);
          
          // Copier les données vers la nouvelle table
          await this.db!.execAsync(`
            INSERT INTO contacts_new (id, firstName, lastName, jobTitle, phone, email, notes, isFavorite, createdAt, updatedAt)
            SELECT id, firstName, lastName, jobTitle, phone, email, notes, isFavorite, createdAt, updatedAt
            FROM contacts
          `);
          
          // Supprimer l'ancienne table et renommer la nouvelle
          await this.db!.execAsync('DROP TABLE contacts');
          await this.db!.execAsync('ALTER TABLE contacts_new RENAME TO contacts');
        });

        // Faire la même chose pour user_profile
        const profileTableExists = await this.db.getFirstAsync<any>(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='user_profile'"
        );
        
        if (profileTableExists) {
          const profileTableInfo = await this.db.getAllAsync<any>("PRAGMA table_info(user_profile)");
          const profileHasOldStructure = profileTableInfo.some((col: any) => col.name === 'name');
          const profileHasNewStructure = profileTableInfo.some((col: any) => col.name === 'firstName');

          if (profileHasOldStructure && !profileHasNewStructure) {
          await this.db.withTransactionAsync(async () => {
            // Ajouter les nouvelles colonnes
            await this.db!.execAsync('ALTER TABLE user_profile ADD COLUMN firstName TEXT DEFAULT ""');
            await this.db!.execAsync('ALTER TABLE user_profile ADD COLUMN lastName TEXT DEFAULT ""');
            
            // Récupérer le profil existant
            const profile = await this.db!.getFirstAsync<any>('SELECT id, name FROM user_profile WHERE id = 1');
            
            if (profile && profile.name) {
              const parts = profile.name.trim().split(' ');
              const firstName = parts[0] || '';
              const lastName = parts.slice(1).join(' ') || '';
              
              await this.db!.runAsync(
                'UPDATE user_profile SET firstName = ?, lastName = ? WHERE id = 1',
                [firstName, lastName]
              );
            }
            
            // Créer une nouvelle table temporaire avec la nouvelle structure
            await this.db!.execAsync(`
              CREATE TABLE user_profile_new (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                firstName TEXT NOT NULL DEFAULT '',
                lastName TEXT NOT NULL DEFAULT '',
                jobTitle TEXT NOT NULL DEFAULT '',
                phoneNumber TEXT NOT NULL DEFAULT '',
                email TEXT NOT NULL DEFAULT '',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
              );
            `);
            
            // Copier les données vers la nouvelle table
            await this.db!.execAsync(`
              INSERT INTO user_profile_new (id, firstName, lastName, jobTitle, phoneNumber, email, createdAt, updatedAt)
              SELECT id, firstName, lastName, jobTitle, phoneNumber, email, createdAt, updatedAt
              FROM user_profile
            `);
            
            // Supprimer l'ancienne table et renommer la nouvelle
            await this.db!.execAsync('DROP TABLE user_profile');
            await this.db!.execAsync('ALTER TABLE user_profile_new RENAME TO user_profile');
          });
          }
        }

        console.log('Migration de la base de données terminée avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la migration de la base de données:', error);
      // En cas d'erreur de migration, on peut reset la base
      console.log('Reset de la base de données à cause de l\'erreur de migration');
      await this.resetDatabase();
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create contacts table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        jobTitle TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        notes TEXT DEFAULT '',
        isFavorite INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create work_locations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS work_locations (
        id TEXT PRIMARY KEY,
        contactId TEXT NOT NULL,
        country TEXT NOT NULL,
        region TEXT,
        isLocalResident INTEGER DEFAULT 0,
        hasVehicle INTEGER DEFAULT 0,
        isHoused INTEGER DEFAULT 0,
        isPrimary INTEGER DEFAULT 0,
        FOREIGN KEY (contactId) REFERENCES contacts (id) ON DELETE CASCADE
      );
    `);

    // Create user_profile table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        firstName TEXT NOT NULL DEFAULT '',
        lastName TEXT NOT NULL DEFAULT '',
        jobTitle TEXT NOT NULL DEFAULT '',
        phoneNumber TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user_profile_locations table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile_locations (
        id TEXT PRIMARY KEY,
        country TEXT NOT NULL,
        region TEXT,
        isLocalResident INTEGER DEFAULT 0,
        hasVehicle INTEGER DEFAULT 0,
        isHoused INTEGER DEFAULT 0,
        isPrimary INTEGER DEFAULT 0
      );
    `);

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_contacts_lastName ON contacts(lastName);
      CREATE INDEX IF NOT EXISTS idx_contacts_firstName ON contacts(firstName);
      CREATE INDEX IF NOT EXISTS idx_contacts_jobTitle ON contacts(jobTitle);
      CREATE INDEX IF NOT EXISTS idx_contacts_isFavorite ON contacts(isFavorite);
      CREATE INDEX IF NOT EXISTS idx_work_locations_contactId ON work_locations(contactId);
      CREATE INDEX IF NOT EXISTS idx_work_locations_country ON work_locations(country);
    `);
  }

  // Contact CRUD operations
  async createContact(contact: Omit<Contact, 'id'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await this.db.withTransactionAsync(async () => {
      // Insert contact
      await this.db!.runAsync(
        `INSERT INTO contacts (id, firstName, lastName, jobTitle, phone, email, notes, isFavorite, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [contactId, contact.firstName, contact.lastName, contact.jobTitle, contact.phone, contact.email, 
         contact.notes, contact.isFavorite ? 1 : 0]
      );

      // Insert work locations
      for (const location of contact.locations) {
        const locationId = `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db!.runAsync(
          `INSERT INTO work_locations (id, contactId, country, region, isLocalResident, hasVehicle, isHoused, isPrimary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [locationId, contactId, location.country, location.region || null,
           location.isLocalResident ? 1 : 0, location.hasVehicle ? 1 : 0,
           location.isHoused ? 1 : 0, location.isPrimary ? 1 : 0]
        );
      }
    });

    return contactId;
  }

  async getContact(contactId: string): Promise<Contact | null> {
    if (!this.db) throw new Error('Database not initialized');

    const contactRow = await this.db.getFirstAsync<ContactRow>(
      'SELECT * FROM contacts WHERE id = ?',
      [contactId]
    );

    if (!contactRow) return null;

    const locationRows = await this.db.getAllAsync<WorkLocationRow>(
      'SELECT * FROM work_locations WHERE contactId = ?',
      [contactId]
    );

    return this.mapToContact(contactRow, locationRows);
  }

  async getAllContacts(): Promise<Contact[]> {
    if (!this.db) throw new Error('Database not initialized');

    const contactRows = await this.db.getAllAsync<ContactRow>(
      'SELECT * FROM contacts ORDER BY lastName ASC, firstName ASC'
    );

    const contacts: Contact[] = [];

    for (const contactRow of contactRows) {
      const locationRows = await this.db.getAllAsync<WorkLocationRow>(
        'SELECT * FROM work_locations WHERE contactId = ?',
        [contactRow.id]
      );

      contacts.push(this.mapToContact(contactRow, locationRows));
    }

    return contacts;
  }

  async updateContact(contactId: string, contact: Omit<Contact, 'id'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.withTransactionAsync(async () => {
      // Update contact
      await this.db!.runAsync(
        `UPDATE contacts 
         SET firstName = ?, lastName = ?, jobTitle = ?, phone = ?, email = ?, notes = ?, isFavorite = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [contact.firstName, contact.lastName, contact.jobTitle, contact.phone, contact.email, 
         contact.notes, contact.isFavorite ? 1 : 0, contactId]
      );

      // Delete existing work locations
      await this.db!.runAsync('DELETE FROM work_locations WHERE contactId = ?', [contactId]);

      // Insert updated work locations
      for (const location of contact.locations) {
        const locationId = `location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db!.runAsync(
          `INSERT INTO work_locations (id, contactId, country, region, isLocalResident, hasVehicle, isHoused, isPrimary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [locationId, contactId, location.country, location.region || null,
           location.isLocalResident ? 1 : 0, location.hasVehicle ? 1 : 0,
           location.isHoused ? 1 : 0, location.isPrimary ? 1 : 0]
        );
      }
    });
  }

  async deleteContact(contactId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.withTransactionAsync(async () => {
      await this.db!.runAsync('DELETE FROM work_locations WHERE contactId = ?', [contactId]);
      await this.db!.runAsync('DELETE FROM contacts WHERE id = ?', [contactId]);
    });
  }

  async searchContacts(query: string): Promise<Contact[]> {
    if (!this.db) throw new Error('Database not initialized');
    if (!query.trim()) return this.getAllContacts();

    const searchTerm = `%${query.trim()}%`;
    const contactRows = await this.db.getAllAsync<ContactRow>(
      `SELECT * FROM contacts 
       WHERE firstName LIKE ? OR lastName LIKE ? OR jobTitle LIKE ? OR phone LIKE ? OR email LIKE ? OR notes LIKE ?
       ORDER BY lastName ASC, firstName ASC`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const contacts: Contact[] = [];

    for (const contactRow of contactRows) {
      const locationRows = await this.db.getAllAsync<WorkLocationRow>(
        'SELECT * FROM work_locations WHERE contactId = ?',
        [contactRow.id]
      );

      contacts.push(this.mapToContact(contactRow, locationRows));
    }

    return contacts;
  }

  async findContactByNameAndPhone(fullName: string, phone: string): Promise<Contact | null> {
    if (!this.db) throw new Error('Database not initialized');

    // Try to parse the full name
    const parts = fullName.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    // Search by firstName, lastName and phone
    const contactRow = await this.db.getFirstAsync<ContactRow>(
      'SELECT * FROM contacts WHERE firstName = ? AND lastName = ? AND phone = ?',
      [firstName, lastName, phone]
    );

    if (!contactRow) return null;

    const locationRows = await this.db.getAllAsync<WorkLocationRow>(
      'SELECT * FROM work_locations WHERE contactId = ?',
      [contactRow.id]
    );

    return this.mapToContact(contactRow, locationRows);
  }

  // User Profile operations
  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    const profileRow = await this.db.getFirstAsync<any>(
      'SELECT * FROM user_profile WHERE id = 1'
    );

    if (!profileRow) return null;

    const locationRows = await this.db.getAllAsync<any>(
      'SELECT * FROM user_profile_locations'
    );

    return {
      firstName: profileRow.firstName || '',
      lastName: profileRow.lastName || '',
      jobTitle: profileRow.jobTitle,
      phoneNumber: profileRow.phoneNumber,
      email: profileRow.email,
      isFavorite: false,
      locations: locationRows.map((row: any) => ({
        id: row.id,
        country: row.country,
        region: row.region,
        isLocalResident: Boolean(row.isLocalResident),
        hasVehicle: Boolean(row.hasVehicle),
        isHoused: Boolean(row.isHoused),
        isPrimary: Boolean(row.isPrimary)
      }))
    };
  }

  async saveUserProfile(profile: UserProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.withTransactionAsync(async () => {
      // Upsert user profile
      await this.db!.runAsync(
        `INSERT OR REPLACE INTO user_profile (id, firstName, lastName, jobTitle, phoneNumber, email, updatedAt)
         VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [profile.firstName, profile.lastName, profile.jobTitle, profile.phoneNumber, profile.email]
      );

      // Delete existing locations
      await this.db!.runAsync('DELETE FROM user_profile_locations');

      // Insert new locations
      for (const location of profile.locations) {
        const locationId = `profile_location_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await this.db!.runAsync(
          `INSERT INTO user_profile_locations (id, country, region, isLocalResident, hasVehicle, isHoused, isPrimary)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [locationId, location.country, location.region || null,
           location.isLocalResident ? 1 : 0, location.hasVehicle ? 1 : 0,
           location.isHoused ? 1 : 0, location.isPrimary ? 1 : 0]
        );
      }
    });
  }

  // Helper methods
  private mapToContact(contactRow: ContactRow, locationRows: WorkLocationRow[]): Contact {
    const locations: WorkLocation[] = locationRows.map(row => ({
      id: row.id,
      country: row.country,
      region: row.region,
      isLocalResident: Boolean(row.isLocalResident),
      hasVehicle: Boolean(row.hasVehicle),
      isHoused: Boolean(row.isHoused),
      isPrimary: Boolean(row.isPrimary)
    }));

    const primaryLocation = locations.find(loc => loc.isPrimary);
    const secondaryLocations = locations.filter(loc => !loc.isPrimary);

    return {
      id: contactRow.id,
      firstName: contactRow.firstName,
      lastName: contactRow.lastName,
      jobTitle: contactRow.jobTitle,
      phone: contactRow.phone,
      email: contactRow.email,
      notes: contactRow.notes,
      isFavorite: Boolean(contactRow.isFavorite),
      locations,
      city: primaryLocation?.region || primaryLocation?.country,
      primaryLocation,
      secondaryLocations
    };
  }

  async getContactCount(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM contacts'
    );

    return result?.count || 0;
  }

  async clearAllContacts(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.withTransactionAsync(async () => {
      await this.db!.runAsync('DELETE FROM work_locations');
      await this.db!.runAsync('DELETE FROM contacts');
    });

    console.log('All contacts cleared successfully');
  }

  async getFavoriteContacts(): Promise<Contact[]> {
    if (!this.db) throw new Error('Database not initialized');

    const contactRows = await this.db.getAllAsync<ContactRow>(
      'SELECT * FROM contacts WHERE isFavorite = 1 ORDER BY name ASC'
    );

    const contacts: Contact[] = [];

    for (const contactRow of contactRows) {
      const locationRows = await this.db.getAllAsync<WorkLocationRow>(
        'SELECT * FROM work_locations WHERE contactId = ?',
        [contactRow.id]
      );

      contacts.push(this.mapToContact(contactRow, locationRows));
    }

    return contacts;
  }
}