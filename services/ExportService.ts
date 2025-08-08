// MyCrew React Native - Export Service
// Support pour JSON, CSV, vCard

import { Contact, WorkLocation } from './DatabaseService';
import { UserProfile } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

export type ExportFormat = 'JSON' | 'CSV' | 'vCard';

export class ExportService {
  
  // Convertir un contact vers le format d'export
  static contactToExportFormat(contact: Contact): ExportContact {
    return {
      name: contact.name,
      jobTitle: contact.jobTitle,
      phone: contact.phone,
      email: contact.email,
      notes: contact.notes,
      isFavorite: contact.isFavorite,
      locations: contact.locations.map(loc => ({
        country: loc.country,
        region: loc.region,
        isLocalResident: loc.isLocalResident,
        hasVehicle: loc.hasVehicle,
        isHoused: loc.isHoused,
        isPrimary: loc.isPrimary
      }))
    };
  }

  // Export vers JSON
  static async exportToJSON(contacts: Contact[]): Promise<string> {
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      source: 'MyCrew React Native',
      contacts: contacts.map(contact => this.contactToExportFormat(contact))
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Export vers CSV
  static async exportToCSV(contacts: Contact[]): Promise<string> {
    const headers = [
      'Nom',
      'Métier', 
      'Téléphone',
      'Email',
      'Notes',
      'Favori',
      'Pays principal',
      'Région principale',
      'Résident fiscal',
      'Véhicule',
      'Logé'
    ];
    
    let csv = headers.join(',') + '\n';
    
    for (const contact of contacts) {
      const primaryLocation = contact.locations.find(loc => loc.isPrimary) || contact.locations[0];
      
      const row = [
        this.escapeCsvValue(contact.name),
        this.escapeCsvValue(contact.jobTitle),
        this.escapeCsvValue(contact.phone),
        this.escapeCsvValue(contact.email),
        this.escapeCsvValue(contact.notes),
        contact.isFavorite ? 'Oui' : 'Non',
        primaryLocation ? this.escapeCsvValue(primaryLocation.country) : '',
        primaryLocation ? this.escapeCsvValue(primaryLocation.region || '') : '',
        primaryLocation ? (primaryLocation.isLocalResident ? 'Oui' : 'Non') : '',
        primaryLocation ? (primaryLocation.hasVehicle ? 'Oui' : 'Non') : '',
        primaryLocation ? (primaryLocation.isHoused ? 'Oui' : 'Non') : ''
      ];
      
      csv += row.join(',') + '\n';
    }
    
    return csv;
  }

  // Export vers vCard
  static async exportToVCard(contacts: Contact[]): Promise<string> {
    let vcard = '';
    
    for (const contact of contacts) {
      vcard += 'BEGIN:VCARD\n';
      vcard += 'VERSION:3.0\n';
      vcard += `FN:${contact.name}\n`;
      vcard += `ORG:${contact.jobTitle}\n`;
      
      if (contact.phone) {
        vcard += `TEL;TYPE=WORK:${contact.phone}\n`;
      }
      
      if (contact.email) {
        vcard += `EMAIL;TYPE=WORK:${contact.email}\n`;
      }
      
      if (contact.notes) {
        vcard += `NOTE:${contact.notes.replace(/\n/g, '\\n')}\n`;
      }
      
      // Ajouter la localisation principale comme adresse
      const primaryLocation = contact.locations.find(loc => loc.isPrimary);
      if (primaryLocation) {
        vcard += `ADR;TYPE=WORK:;;${primaryLocation.region || ''};${primaryLocation.country};;;;\n`;
      }
      
      vcard += 'END:VCARD\n\n';
    }
    
    return vcard;
  }

  // Exporter et partager
  static async exportAndShare(contacts: Contact[], format: ExportFormat, filename?: string): Promise<void> {
    try {
      let content: string;
      let extension: string;
      let mimeType: string;
      
      switch (format) {
        case 'JSON':
          content = await this.exportToJSON(contacts);
          extension = 'json';
          mimeType = 'application/json';
          break;
        case 'CSV':
          content = await this.exportToCSV(contacts);
          extension = 'csv';
          mimeType = 'text/csv';
          break;
        case 'vCard':
          content = await this.exportToVCard(contacts);
          extension = 'vcf';
          mimeType = 'text/vcard';
          break;
        default:
          throw new Error(`Format non supporté: ${format}`);
      }
      
      const finalFilename = filename || `mycrew_contacts_${new Date().toISOString().split('T')[0]}.${extension}`;
      const fileUri = FileSystem.documentDirectory + finalFilename;
      
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Exporter ${contacts.length} contact${contacts.length > 1 ? 's' : ''} MyCrew`
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw new Error(`Erreur lors de l'export: ${error.message}`);
    }
  }

  // Export du profil utilisateur
  static async exportUserProfile(profile: UserProfile, format: ExportFormat): Promise<void> {
    // Convertir le profil utilisateur en format Contact pour l'export
    const contactVersion: Contact = {
      id: 'user-profile',
      name: profile.name,
      jobTitle: profile.jobTitle,
      phone: profile.phoneNumber,
      email: profile.email,
      notes: 'Profil utilisateur MyCrew',
      isFavorite: false,
      locations: profile.locations.map(loc => ({
        id: `user-${loc.id}`,
        country: loc.country,
        region: loc.region,
        isLocalResident: loc.isLocalResident,
        hasVehicle: loc.hasVehicle,
        isHoused: loc.isHoused,
        isPrimary: loc.isPrimary
      }))
    };
    
    await this.exportAndShare([contactVersion], format, `mycrew_profil_${profile.name.replace(/\s+/g, '_').toLowerCase()}`);
  }

  // Utilitaire pour échapper les valeurs CSV
  private static escapeCsvValue(value: string): string {
    if (!value) return '';
    
    // Si la valeur contient une virgule, des guillemets ou un saut de ligne
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // Échapper les guillemets en les doublant et entourer de guillemets
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  // Obtenir les statistiques d'export
  static getExportStats(contacts: Contact[]): {
    totalContacts: number;
    favoriteContacts: number;
    contactsWithLocations: number;
    uniqueCountries: number;
    uniqueJobs: number;
  } {
    const uniqueCountries = new Set<string>();
    const uniqueJobs = new Set<string>();
    let contactsWithLocations = 0;
    let favoriteContacts = 0;
    
    for (const contact of contacts) {
      if (contact.isFavorite) favoriteContacts++;
      if (contact.locations.length > 0) {
        contactsWithLocations++;
        contact.locations.forEach(loc => uniqueCountries.add(loc.country));
      }
      if (contact.jobTitle) uniqueJobs.add(contact.jobTitle);
    }
    
    return {
      totalContacts: contacts.length,
      favoriteContacts,
      contactsWithLocations,
      uniqueCountries: uniqueCountries.size,
      uniqueJobs: uniqueJobs.size
    };
  }
}