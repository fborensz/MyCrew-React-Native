// MyCrew React Native - QR Code Service
// Handles QR code generation and parsing for contact sharing

import { Contact, UserProfile, QRContactData, getContactFullName, getUserProfileFullName } from '../types';

export class QRCodeService {
  private static readonly QR_TYPE = 'MyCrew_Contact';
  private static readonly QR_TYPE_MULTI = 'MyCrew_ContactList';
  private static readonly QR_VERSION = '1.0';
  private static readonly MAX_MULTI_CONTACTS = 10;

  // Generate QR code data from contact
  static generateContactQRData(contact: Contact): string {
    const qrData: QRContactData = {
      type: this.QR_TYPE,
      version: this.QR_VERSION,
      data: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        jobTitle: contact.jobTitle,
        phone: contact.phone,
        email: contact.email,
        notes: '',
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
        firstName: profile.firstName,
        lastName: profile.lastName,
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
        firstName: qrData.data.firstName || '',
        lastName: qrData.data.lastName || '',
        jobTitle: qrData.data.jobTitle || '',
        phone: qrData.data.phone || '',
        email: qrData.data.email || '',
        notes: '',
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
      typeof data.data.firstName === 'string' &&
      typeof data.data.lastName === 'string' &&
      typeof data.data.jobTitle === 'string' &&
      typeof data.data.phone === 'string' &&
      typeof data.data.email === 'string'
    );
  }

  // Create a simple contact card for quick sharing (like business card)
  static generateSimpleContactCard(contact: Contact): string {
    const primaryLocation = contact.locations.find(loc => loc.isPrimary);
    const city = primaryLocation?.region || primaryLocation?.country || '';
    
    let card = `${getContactFullName(contact)}\n`;
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
    
    let card = `${getUserProfileFullName(profile)}\n`;
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

  // Generate QR code data from multiple contacts (max 10)
  static generateMultiContactQRData(contacts: Contact[]): { success: boolean; data?: string; error?: string; count: number } {
    if (contacts.length === 0) {
      return { success: false, error: 'Aucun contact sélectionné', count: 0 };
    }
    
    if (contacts.length > this.MAX_MULTI_CONTACTS) {
      return { 
        success: false, 
        error: `Maximum ${this.MAX_MULTI_CONTACTS} contacts autorisés`, 
        count: contacts.length 
      };
    }

    try {
      const qrData = {
        type: this.QR_TYPE_MULTI,
        version: this.QR_VERSION,
        count: contacts.length,
        data: contacts.map(contact => ({
          firstName: contact.firstName,
          lastName: contact.lastName,
          jobTitle: contact.jobTitle,
          phone: contact.phone,
          email: contact.email,
          notes: '', // Omettre les notes pour économiser l'espace
          locations: contact.locations
            .filter(loc => loc.isPrimary) // Seulement la localisation primaire
            .map(location => ({
              country: location.country,
              region: location.region,
              isLocalResident: location.isLocalResident,
              hasVehicle: location.hasVehicle,
              isHoused: location.isHoused,
              isPrimary: location.isPrimary
            }))
        }))
      };

      const jsonString = JSON.stringify(qrData);
      
      // Vérifier la taille (estimation conservative)
      const sizeEstimate = new Blob([jsonString]).size;
      if (sizeEstimate > 2500) { // Limite de sécurité
        return {
          success: false,
          error: `Données trop volumineuses (${sizeEstimate}B). Réduisez à ${Math.floor(contacts.length * 0.8)} contacts.`,
          count: contacts.length
        };
      }

      return { 
        success: true, 
        data: jsonString,
        count: contacts.length 
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: 'Erreur lors de la génération', 
        count: contacts.length 
      };
    }
  }

  // Parse multi-contact QR code data
  static parseMultiContactQRData(qrString: string): { success: boolean; contacts?: Contact[]; error?: string; count: number } {
    try {
      const qrData = JSON.parse(qrString);

      // Vérifier si c'est un QR multi-contacts
      if (qrData.type !== this.QR_TYPE_MULTI || qrData.version !== this.QR_VERSION) {
        return { success: false, error: 'Format QR multi-contacts invalide', count: 0 };
      }

      if (!qrData.data || !Array.isArray(qrData.data)) {
        return { success: false, error: 'Données de contacts manquantes', count: 0 };
      }

      const contacts: Contact[] = qrData.data.map((contactData: any, index: number) => {
        const contact: Contact = {
          id: `import_multi_${Date.now()}_${index}`,
          firstName: contactData.firstName || '',
          lastName: contactData.lastName || '',
          jobTitle: contactData.jobTitle || '',
          phone: contactData.phone || '',
          email: contactData.email || '',
          notes: '',
          isFavorite: false,
          locations: (contactData.locations || []).map((location: any, locIndex: number) => ({
            id: `location_multi_${Date.now()}_${index}_${locIndex}`,
            country: location.country || '',
            region: location.region,
            isLocalResident: Boolean(location.isLocalResident),
            hasVehicle: Boolean(location.hasVehicle),
            isHoused: Boolean(location.isHoused),
            isPrimary: Boolean(location.isPrimary)
          }))
        };

        // Add computed properties
        const primaryLocation = contact.locations.find(loc => loc.isPrimary);
        contact.primaryLocation = primaryLocation;
        contact.secondaryLocations = contact.locations.filter(loc => !loc.isPrimary);
        contact.city = primaryLocation?.region || primaryLocation?.country;

        return contact;
      });

      return {
        success: true,
        contacts,
        count: contacts.length
      };

    } catch (error) {
      console.error('Erreur parsing QR multi-contacts:', error);
      return { success: false, error: 'Erreur de lecture du QR code', count: 0 };
    }
  }

  // Vérifier si c'est un QR MyCrew (simple ou multi)
  static isMyCyewQRCode(qrString: string): boolean {
    try {
      const data = JSON.parse(qrString);
      return (data.type === this.QR_TYPE || data.type === this.QR_TYPE_MULTI) && 
             data.version === this.QR_VERSION;
    } catch {
      return false;
    }
  }

  // Détecter le type de QR Code
  static getQRType(qrString: string): 'single' | 'multi' | 'invalid' {
    try {
      const data = JSON.parse(qrString);
      if (data.version !== this.QR_VERSION) return 'invalid';
      
      if (data.type === this.QR_TYPE) return 'single';
      if (data.type === this.QR_TYPE_MULTI) return 'multi';
      
      return 'invalid';
    } catch {
      return 'invalid';
    }
  }

  // Extract basic info from QR string for preview
  static getQRPreviewInfo(qrString: string): { name: string; jobTitle: string; isValid: boolean; type: 'single' | 'multi'; count?: number } | null {
    try {
      const qrType = this.getQRType(qrString);
      if (qrType === 'invalid') return null;

      const data = JSON.parse(qrString);

      if (qrType === 'single') {
        if (!this.isValidQRData(data)) return null;
        
        return {
          name: `${data.data.firstName} ${data.data.lastName}`.trim() || 'Nom inconnu',
          jobTitle: data.data.jobTitle || 'Métier non spécifié',
          isValid: true,
          type: 'single'
        };
      }

      if (qrType === 'multi') {
        const count = data.count || (data.data ? data.data.length : 0);
        const firstContact = data.data && data.data[0];
        
        return {
          name: `${count} contacts`,
          jobTitle: firstContact ? `${firstContact.firstName} ${firstContact.lastName} et ${count - 1} autres` : 'Liste de contacts',
          isValid: true,
          type: 'multi',
          count
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}