// MyCrew React Native - QR Code Service
// Handles QR code generation and parsing for contact sharing

import { Contact, UserProfile, QRContactData } from '../types';

export class QRCodeService {
  private static readonly QR_TYPE = 'MyCrew_Contact';
  private static readonly QR_VERSION = '1.0';

  // Generate QR code data from contact
  static generateContactQRData(contact: Contact): string {
    const qrData: QRContactData = {
      type: this.QR_TYPE,
      version: this.QR_VERSION,
      data: {
        name: contact.name,
        jobTitle: contact.jobTitle,
        phone: contact.phone,
        email: contact.email,
        notes: contact.notes,
        locations: contact.locations.map(location => ({
          country: location.country,
          region: location.region,
          isLocalResident: location.isLocalResident,
          hasVehicle: location.hasVehicle,
          isHoused: location.isHoused,
          isPrimary: location.isPrimary
        }))
      }
    };

    return JSON.stringify(qrData);
  }

  // Generate QR code data from user profile
  static generateProfileQRData(profile: UserProfile): string {
    const qrData: QRContactData = {
      type: this.QR_TYPE,
      version: this.QR_VERSION,
      data: {
        name: profile.name,
        jobTitle: profile.jobTitle,
        phone: profile.phoneNumber,
        email: profile.email,
        notes: '', // Profiles don't have notes
        locations: profile.locations.map(location => ({
          country: location.country,
          region: location.region,
          isLocalResident: location.isLocalResident,
          hasVehicle: location.hasVehicle,
          isHoused: location.isHoused,
          isPrimary: location.isPrimary
        }))
      }
    };

    return JSON.stringify(qrData);
  }

  // Parse QR code data and validate format
  static parseQRData(qrString: string): Contact | null {
    try {
      const qrData = JSON.parse(qrString) as QRContactData;

      // Validate QR code format
      if (!this.isValidQRData(qrData)) {
        console.log('Invalid QR code format');
        return null;
      }

      // Convert to Contact object
      const contact: Contact = {
        id: `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: qrData.data.name || '',
        jobTitle: qrData.data.jobTitle || '',
        phone: qrData.data.phone || '',
        email: qrData.data.email || '',
        notes: qrData.data.notes || '',
        isFavorite: false,
        locations: qrData.data.locations?.map((location, index) => ({
          id: `location_${Date.now()}_${index}`,
          country: location.country || '',
          region: location.region,
          isLocalResident: Boolean(location.isLocalResident),
          hasVehicle: Boolean(location.hasVehicle),
          isHoused: Boolean(location.isHoused),
          isPrimary: Boolean(location.isPrimary)
        })) || []
      };

      // Add computed properties
      const primaryLocation = contact.locations.find(loc => loc.isPrimary);
      contact.primaryLocation = primaryLocation;
      contact.secondaryLocations = contact.locations.filter(loc => !loc.isPrimary);
      contact.city = primaryLocation?.region || primaryLocation?.country;

      return contact;
    } catch (error) {
      console.error('Error parsing QR code:', error);
      return null;
    }
  }

  // Validate QR data structure
  private static isValidQRData(data: any): data is QRContactData {
    return (
      data &&
      typeof data === 'object' &&
      data.type === this.QR_TYPE &&
      data.version === this.QR_VERSION &&
      data.data &&
      typeof data.data === 'object' &&
      typeof data.data.name === 'string' &&
      typeof data.data.jobTitle === 'string' &&
      typeof data.data.phone === 'string' &&
      typeof data.data.email === 'string'
    );
  }

  // Create a simple contact card for quick sharing (like business card)
  static generateSimpleContactCard(contact: Contact): string {
    const primaryLocation = contact.locations.find(loc => loc.isPrimary);
    const city = primaryLocation?.region || primaryLocation?.country || '';
    
    let card = `${contact.name}\n`;
    card += `${contact.jobTitle}\n`;
    
    if (city) {
      card += `${city}\n`;
    }
    
    card += `\n`;
    
    if (contact.phone) {
      card += `📞 ${contact.phone}\n`;
    }
    
    if (contact.email) {
      card += `📧 ${contact.email}\n`;
    }
    
    if (contact.notes) {
      card += `\n${contact.notes}`;
    }

    return card;
  }

  // Create a simple profile card for sharing
  static generateSimpleProfileCard(profile: UserProfile): string {
    const primaryLocation = profile.locations.find(loc => loc.isPrimary);
    const city = primaryLocation?.region || primaryLocation?.country || '';
    
    let card = `${profile.name}\n`;
    card += `${profile.jobTitle}\n`;
    
    if (city) {
      card += `${city}\n`;
    }
    
    card += `\n`;
    
    if (profile.phoneNumber) {
      card += `📞 ${profile.phoneNumber}\n`;
    }
    
    if (profile.email) {
      card += `📧 ${profile.email}`;
    }

    return card;
  }

  // Validate if QR string looks like MyCrew format
  static isMyCyewQRCode(qrString: string): boolean {
    try {
      const data = JSON.parse(qrString);
      return data.type === this.QR_TYPE && data.version === this.QR_VERSION;
    } catch {
      return false;
    }
  }

  // Extract basic info from QR string for preview
  static getQRPreviewInfo(qrString: string): { name: string; jobTitle: string; isValid: boolean } | null {
    try {
      const data = JSON.parse(qrString) as QRContactData;
      
      if (!this.isValidQRData(data)) {
        return null;
      }

      return {
        name: data.data.name || 'Nom inconnu',
        jobTitle: data.data.jobTitle || 'Métier non spécifié',
        isValid: true
      };
    } catch {
      return null;
    }
  }
}