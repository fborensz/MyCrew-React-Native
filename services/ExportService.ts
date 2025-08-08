// MyCrew React Native - Export Service
// Support pour JSON, CSV, Text et QR code

import { Contact, UserProfile, getContactFullName, getUserProfileFullName } from '../types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

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

export type ExportFormat = 'json' | 'csv' | 'text' | 'qr';

export interface ExportData {
  version: string;
  exportDate: string;
  type: 'contact' | 'profile' | 'contacts';
  data: Contact | UserProfile | Contact[];
}

export class ExportService {
  
  // Convertir un contact vers le format d'export
  static contactToExportFormat(contact: Contact): ExportContact {
    return {
      firstName: contact.firstName,
      lastName: contact.lastName,
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

  // Export to JSON (reusable format)
  static exportToJSON(data: Contact | UserProfile | Contact[], type: 'contact' | 'profile' | 'contacts'): string {
    const exportData: ExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      type,
      data
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Export to CSV format (Excel compatible)
  static exportToCSV(contacts: Contact[]): string {
    if (contacts.length === 0) return '';
    
    const headers = [
      'Prénom',
      'Nom',
      'Métier',
      'Téléphone',
      'Email',
      'Pays',
      'Région',
      'Résidence fiscale',
      'Véhiculé',
      'Logé'
    ];
    
    const rows = contacts.map(contact => {
      const primaryLocation = contact.locations?.find(loc => loc.isPrimary) || contact.locations?.[0];
      
      return [
        this.escapeCSV(contact.firstName),
        this.escapeCSV(contact.lastName),
        this.escapeCSV(contact.jobTitle),
        this.escapeCSV(contact.phone),
        this.escapeCSV(contact.email),
        this.escapeCSV(primaryLocation?.country || ''),
        this.escapeCSV(primaryLocation?.region || ''),
        primaryLocation?.isLocalResident ? 'Oui' : 'Non',
        primaryLocation?.hasVehicle ? 'Oui' : 'Non',
        primaryLocation?.isHoused ? 'Oui' : 'Non'
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Add BOM for Excel UTF-8 compatibility
    return '\uFEFF' + csvContent;
  }

  // Export to readable text format
  static exportToText(contacts: Contact[]): string {
    if (contacts.length === 0) return 'Aucun contact à exporter';
    
    const textContent = contacts.map((contact, index) => {
      const primaryLocation = contact.locations?.find(loc => loc.isPrimary) || contact.locations?.[0];
      const attributes = [];
      
      if (primaryLocation?.isLocalResident) attributes.push('Résidence fiscale');
      if (primaryLocation?.hasVehicle) attributes.push('Véhiculé');
      if (primaryLocation?.isHoused) attributes.push('Logé');
      
      let contactText = `${index + 1}. ${getContactFullName(contact)}\n`;
      contactText += `   Métier: ${contact.jobTitle}\n`;
      contactText += `   Tél: ${contact.phone}\n`;
      contactText += `   Email: ${contact.email}\n`;
      
      if (primaryLocation) {
        contactText += `   Localisation: ${primaryLocation.region ? `${primaryLocation.region}, ` : ''}${primaryLocation.country}\n`;
      }
      
      if (attributes.length > 0) {
        contactText += `   Attributs: ${attributes.join(', ')}\n`;
      }
      
      return contactText;
    }).join('\n');
    
    const header = `=== MYCREW - LISTE DES CONTACTS ===\n`;
    const footer = `\n=== Exporté le ${new Date().toLocaleDateString('fr-FR')} ===`;
    
    return header + '\n' + textContent + footer;
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
      firstName: profile.firstName,
      lastName: profile.lastName,
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

  // Export single contact for QR code
  static exportContactForQR(contact: Contact): string {
    const primaryLocation = contact.locations?.find(loc => loc.isPrimary) || contact.locations?.[0];
    
    // Compact format for QR code (to minimize data size)
    const qrData = {
      v: '1', // version
      n: contact.name,
      j: contact.jobTitle,
      p: contact.phone,
      e: contact.email,
      l: primaryLocation ? {
        c: primaryLocation.country,
        r: primaryLocation.region,
        lr: primaryLocation.isLocalResident ? 1 : 0,
        v: primaryLocation.hasVehicle ? 1 : 0,
        h: primaryLocation.isHoused ? 1 : 0
      } : null,
      // Removed notes and favorite status from QR export
    };
    
    return JSON.stringify(qrData);
  }
  
  // Export profile for QR code
  static exportProfileForQR(profile: UserProfile): string {
    const primaryLocation = profile.locations?.find(loc => loc.isPrimary) || profile.locations?.[0];
    
    const qrData = {
      v: '1',
      t: 'profile', // type
      n: profile.name,
      j: profile.jobTitle,
      p: profile.phoneNumber,
      e: profile.email,
      l: primaryLocation ? {
        c: primaryLocation.country,
        r: primaryLocation.region,
        lr: primaryLocation.isLocalResident ? 1 : 0,
        v: primaryLocation.hasVehicle ? 1 : 0,
        h: primaryLocation.isHoused ? 1 : 0
      } : null
    };
    
    return JSON.stringify(qrData);
  }
  
  // Save and share file
  static async saveAndShareFile(content: string, filename: string, mimeType: string): Promise<void> {
    try {
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: 'Exporter les contacts'
        });
      } else {
        throw new Error('Le partage n\'est pas disponible sur cet appareil');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
  
  // Helper to escape CSV values
  private static escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
  
  // Generate filename with timestamp
  static generateFilename(format: ExportFormat, type: 'contact' | 'profile' | 'contacts'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const prefix = type === 'contacts' ? 'contacts' : type === 'profile' ? 'profil' : 'contact';
    
    switch (format) {
      case 'json':
        return `mycrew_${prefix}_${timestamp}.json`;
      case 'csv':
        return `mycrew_${prefix}_${timestamp}.csv`;
      case 'text':
        return `mycrew_${prefix}_${timestamp}.txt`;
      default:
        return `mycrew_${prefix}_${timestamp}.txt`;
    }
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