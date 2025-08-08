// MyCrew React Native - Import Service
// Support pour JSON, CSV, vCard et QR codes

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import DatabaseService, { Contact, WorkLocation } from './DatabaseService';
import { ExportContact } from './ExportService';

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates: number;
}

export interface ImportSource {
  type: 'file' | 'qr';
  data?: string;
  uri?: string;
}

export class ImportService {
  
  // Détecter le format d'un fichier
  static detectFileFormat(filename: string, content: string): 'JSON' | 'CSV' | 'vCard' | 'unknown' {
    const extension = filename.toLowerCase().split('.').pop();
    
    if (extension === 'json' || content.trim().startsWith('{')) {
      return 'JSON';
    }
    
    if (extension === 'csv' || content.includes(',')) {
      return 'CSV';
    }
    
    if (extension === 'vcf' || content.includes('BEGIN:VCARD')) {
      return 'vCard';
    }
    
    return 'unknown';
  }

  // Import depuis un fichier
  static async importFromFile(): Promise<ImportResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/csv', 'text/vcard', 'text/x-vcard'],
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return {
          success: false,
          imported: 0,
          errors: ['Import annulé par l\'utilisateur'],
          duplicates: 0
        };
      }
      
      const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const format = this.detectFileFormat(result.assets[0].name, fileContent);
      
      return await this.processImportData(fileContent, format);
      
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Erreur lecture fichier: ${error.message}`],
        duplicates: 0
      };
    }
  }

  // Import depuis QR code
  static async importFromQRCode(qrData: string): Promise<ImportResult> {
    try {
      // Essayer de parser comme JSON d'abord
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.type === 'MyCrew_Contact' && parsedData.data) {
        // Format QR Code MyCrew
        const contact = await this.convertQRToContact(parsedData.data);
        const existingContact = await DatabaseService.findContactByNameAndPhone(contact.name, contact.phone);
        
        if (existingContact) {
          return {
            success: false,
            imported: 0,
            errors: [],
            duplicates: 1
          };
        }
        
        await DatabaseService.addContact(contact);
        
        return {
          success: true,
          imported: 1,
          errors: [],
          duplicates: 0
        };
      }
      
      return {
        success: false,
        imported: 0,
        errors: ['Format QR Code non reconnu'],
        duplicates: 0
      };
      
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Erreur parsing QR Code: ${error.message}`],
        duplicates: 0
      };
    }
  }

  // Traiter les données d'import selon le format
  static async processImportData(content: string, format: 'JSON' | 'CSV' | 'vCard' | 'unknown'): Promise<ImportResult> {
    switch (format) {
      case 'JSON':
        return await this.importFromJSON(content);
      case 'CSV':
        return await this.importFromCSV(content);
      case 'vCard':
        return await this.importFromVCard(content);
      default:
        return {
          success: false,
          imported: 0,
          errors: ['Format de fichier non supporté'],
          duplicates: 0
        };
    }
  }

  // Import depuis JSON
  static async importFromJSON(content: string): Promise<ImportResult> {
    try {
      const data = JSON.parse(content);
      const contacts = data.contacts || (Array.isArray(data) ? data : [data]);
      
      let imported = 0;
      let duplicates = 0;
      const errors: string[] = [];
      
      for (const contactData of contacts) {
        try {
          const contact = await this.convertExportToContact(contactData);
          const existing = await DatabaseService.findContactByNameAndPhone(contact.name, contact.phone);
          
          if (existing) {
            duplicates++;
            continue;
          }
          
          await DatabaseService.addContact(contact);
          imported++;
          
        } catch (contactError) {
          errors.push(`Erreur contact "${contactData.name || 'Unknown'}": ${contactError.message}`);
        }
      }
      
      return {
        success: imported > 0,
        imported,
        errors,
        duplicates
      };
      
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Erreur parsing JSON: ${error.message}`],
        duplicates: 0
      };
    }
  }

  // Import depuis CSV
  static async importFromCSV(content: string): Promise<ImportResult> {
    try {
      const lines = content.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('Fichier CSV vide ou invalide');
      }
      
      const headers = this.parseCSVLine(lines[0]);
      let imported = 0;
      let duplicates = 0;
      const errors: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = this.parseCSVLine(lines[i]);
          const contactData = this.csvRowToContact(headers, values);
          
          if (!contactData.name) continue;
          
          const existing = await DatabaseService.findContactByNameAndPhone(contactData.name, contactData.phone);
          
          if (existing) {
            duplicates++;
            continue;
          }
          
          await DatabaseService.addContact(contactData);
          imported++;
          
        } catch (contactError) {
          errors.push(`Erreur ligne ${i + 1}: ${contactError.message}`);
        }
      }
      
      return {
        success: imported > 0,
        imported,
        errors,
        duplicates
      };
      
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Erreur parsing CSV: ${error.message}`],
        duplicates: 0
      };
    }
  }

  // Import depuis vCard
  static async importFromVCard(content: string): Promise<ImportResult> {
    try {
      const vcardBlocks = content.split('BEGIN:VCARD').filter(block => block.trim());
      let imported = 0;
      let duplicates = 0;
      const errors: string[] = [];
      
      for (const block of vcardBlocks) {
        try {
          const contact = this.parseVCard('BEGIN:VCARD' + block);
          
          if (!contact.name) continue;
          
          const existing = await DatabaseService.findContactByNameAndPhone(contact.name, contact.phone);
          
          if (existing) {
            duplicates++;
            continue;
          }
          
          await DatabaseService.addContact(contact);
          imported++;
          
        } catch (contactError) {
          errors.push(`Erreur vCard: ${contactError.message}`);
        }
      }
      
      return {
        success: imported > 0,
        imported,
        errors,
        duplicates
      };
      
    } catch (error) {
      return {
        success: false,
        imported: 0,
        errors: [`Erreur parsing vCard: ${error.message}`],
        duplicates: 0
      };
    }
  }

  // Utilitaires de conversion
  static async convertExportToContact(exportData: ExportContact): Promise<Omit<Contact, 'id'>> {
    return {
      name: exportData.name || '',
      jobTitle: exportData.jobTitle || '',
      phone: exportData.phone || '',
      email: exportData.email || '',
      notes: exportData.notes || '',
      isFavorite: exportData.isFavorite || false,
      locations: exportData.locations?.map(loc => ({
        id: '', // Will be set by database
        country: loc.country,
        region: loc.region,
        isLocalResident: loc.isLocalResident,
        hasVehicle: loc.hasVehicle,
        isHoused: loc.isHoused,
        isPrimary: loc.isPrimary
      })) || []
    };
  }

  static async convertQRToContact(qrData: any): Promise<Omit<Contact, 'id'>> {
    return {
      name: qrData.name || '',
      jobTitle: qrData.jobTitle || '',
      phone: qrData.phone || '',
      email: qrData.email || '',
      notes: qrData.notes || '',
      isFavorite: false,
      locations: qrData.locations?.map(loc => ({
        id: '', // Will be set by database
        country: loc.country,
        region: loc.region,
        isLocalResident: loc.isLocalResident,
        hasVehicle: loc.hasVehicle,
        isHoused: loc.isHoused,
        isPrimary: loc.isPrimary
      })) || []
    };
  }

  static csvRowToContact(headers: string[], values: string[]): Omit<Contact, 'id'> {
    const getValue = (headerName: string) => {
      const index = headers.findIndex(h => 
        h.toLowerCase().includes(headerName.toLowerCase())
      );
      return index >= 0 ? values[index]?.trim() : '';
    };
    
    const locations: Omit<WorkLocation, 'id'>[] = [];
    const country = getValue('pays');
    const region = getValue('région');
    
    if (country) {
      locations.push({
        country,
        region: region || undefined,
        isLocalResident: getValue('résident').toLowerCase() === 'oui',
        hasVehicle: getValue('véhicule').toLowerCase() === 'oui',
        isHoused: getValue('logé').toLowerCase() === 'oui',
        isPrimary: true
      });
    }
    
    return {
      name: getValue('nom'),
      jobTitle: getValue('métier'),
      phone: getValue('téléphone'),
      email: getValue('email'),
      notes: getValue('notes'),
      isFavorite: getValue('favori').toLowerCase() === 'oui',
      locations
    };
  }

  static parseVCard(vcard: string): Omit<Contact, 'id'> {
    const lines = vcard.split('\n').map(line => line.trim()).filter(line => line);
    
    let name = '';
    let jobTitle = '';
    let phone = '';
    let email = '';
    let notes = '';
    let country = '';
    let region = '';
    
    for (const line of lines) {
      if (line.startsWith('FN:')) {
        name = line.substring(3);
      } else if (line.startsWith('ORG:')) {
        jobTitle = line.substring(4);
      } else if (line.startsWith('TEL')) {
        phone = line.split(':')[1];
      } else if (line.startsWith('EMAIL')) {
        email = line.split(':')[1];
      } else if (line.startsWith('NOTE:')) {
        notes = line.substring(5).replace(/\\n/g, '\n');
      } else if (line.startsWith('ADR:')) {
        const addrParts = line.split(':')[1].split(';');
        if (addrParts.length > 3) {
          region = addrParts[2];
          country = addrParts[3];
        }
      }
    }
    
    const locations: Omit<WorkLocation, 'id'>[] = [];
    if (country) {
      locations.push({
        country,
        region: region || undefined,
        isLocalResident: false,
        hasVehicle: false,
        isHoused: false,
        isPrimary: true
      });
    }
    
    return {
      name,
      jobTitle,
      phone,
      email,
      notes,
      isFavorite: false,
      locations
    };
  }

  // Parser CSV avec gestion des guillemets
  static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Guillemet échappé
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
}