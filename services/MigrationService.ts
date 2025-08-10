// MyCrew React Native - Migration Service
// Service pour migrer les contacts et profils existants vers les nouveaux métiers inclusifs

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseService } from './DatabaseService';
import { JobMigration } from '../data/JobMigration';
import { Contact, UserProfile } from '../types';

export class MigrationService {
  private static readonly MIGRATION_VERSION_KEY = '@MyCrew:migration_version';
  private static readonly CURRENT_MIGRATION_VERSION = '1.0.0';

  /**
   * Vérifie si une migration est nécessaire et l'exécute
   */
  static async checkAndRunMigrations(): Promise<void> {
    try {
      const lastMigrationVersion = await AsyncStorage.getItem(this.MIGRATION_VERSION_KEY);
      
      // Si c'est la première fois ou si la version a changé, exécuter les migrations
      if (!lastMigrationVersion || lastMigrationVersion !== this.CURRENT_MIGRATION_VERSION) {
        console.log('🔄 Début de la migration des métiers vers l\'écriture inclusive...');
        
        await this.migrateAllData();
        
        // Sauvegarder la version de migration actuelle
        await AsyncStorage.setItem(this.MIGRATION_VERSION_KEY, this.CURRENT_MIGRATION_VERSION);
        
        console.log('✅ Migration terminée avec succès !');
      } else {
        console.log('✓ Aucune migration nécessaire, données à jour.');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
      // Ne pas bloquer l'app en cas d'erreur de migration
    }
  }

  /**
   * Migre toutes les données (contacts et profil)
   */
  private static async migrateAllData(): Promise<void> {
    const db = DatabaseService.getInstance();
    
    // Migrer les contacts
    await this.migrateContacts(db);
    
    // Migrer le profil utilisateur
    await this.migrateUserProfile(db);
  }

  /**
   * Migre tous les contacts existants
   */
  private static async migrateContacts(db: DatabaseService): Promise<void> {
    try {
      const contacts = await db.getAllContacts();
      let migratedCount = 0;

      for (const contact of contacts) {
        const oldJobTitle = contact.jobTitle;
        const newJobTitle = JobMigration.migrateJobTitle(oldJobTitle);
        
        if (newJobTitle !== oldJobTitle) {
          // Mettre à jour le contact avec le nouveau nom de métier
          const updatedContact: Partial<Contact> = {
            ...contact,
            jobTitle: newJobTitle
          };
          
          await db.updateContact(contact.id, updatedContact);
          migratedCount++;
          
          console.log(`📝 Contact "${contact.firstName} ${contact.lastName}": "${oldJobTitle}" → "${newJobTitle}"`);
        }
      }

      console.log(`✅ ${migratedCount} contacts migrés sur ${contacts.length} contacts trouvés.`);
    } catch (error) {
      console.error('❌ Erreur lors de la migration des contacts:', error);
      throw error;
    }
  }

  /**
   * Migre le profil utilisateur
   */
  private static async migrateUserProfile(db: DatabaseService): Promise<void> {
    try {
      const userProfile = await db.getUserProfile();
      
      if (userProfile) {
        const oldJobTitle = userProfile.jobTitle;
        const newJobTitle = JobMigration.migrateJobTitle(oldJobTitle);
        
        if (newJobTitle !== oldJobTitle) {
          // Mettre à jour le profil avec le nouveau nom de métier
          const updatedProfile: UserProfile = {
            ...userProfile,
            jobTitle: newJobTitle
          };
          
          await db.saveUserProfile(updatedProfile);
          
          console.log(`👤 Profil utilisateur: "${oldJobTitle}" → "${newJobTitle}"`);
        } else {
          console.log('✓ Profil utilisateur déjà à jour.');
        }
      } else {
        console.log('ℹ️ Aucun profil utilisateur à migrer.');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la migration du profil:', error);
      throw error;
    }
  }

  /**
   * Réinitialise le statut de migration (pour forcer une nouvelle migration)
   * ⚠️ À utiliser uniquement en développement
   */
  static async resetMigrationStatus(): Promise<void> {
    await AsyncStorage.removeItem(this.MIGRATION_VERSION_KEY);
    console.log('🔄 Statut de migration réinitialisé.');
  }

  /**
   * Obtient des statistiques sur les migrations possibles
   */
  static async getMigrationStats(): Promise<{
    totalContacts: number;
    contactsNeedingMigration: number;
    profileNeedsMigration: boolean;
    availableMappings: number;
  }> {
    const db = DatabaseService.getInstance();
    
    // Analyser les contacts
    const contacts = await db.getAllContacts();
    const contactsNeedingMigration = contacts.filter(contact => 
      JobMigration.needsMigration(contact.jobTitle)
    ).length;
    
    // Analyser le profil
    const userProfile = await db.getUserProfile();
    const profileNeedsMigration = userProfile ? JobMigration.needsMigration(userProfile.jobTitle) : false;
    
    return {
      totalContacts: contacts.length,
      contactsNeedingMigration,
      profileNeedsMigration,
      availableMappings: JobMigration.getMigrationCount()
    };
  }
}