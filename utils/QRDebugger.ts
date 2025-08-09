// MyCrew React Native - QR Code Debugger
// Utilitaire pour tester et debugger les QR codes

import { QRCodeService } from '../services/QRCodeService';
import { Contact, UserProfile } from '../types';

export class QRDebugger {
  // Créer des données de test
  static createTestContact(): Contact {
    return {
      id: 'test_contact_123',
      firstName: 'Jean',
      lastName: 'Dupont',
      jobTitle: 'Réalisateur',
      phone: '+33123456789',
      email: 'jean.dupont@example.com',
      notes: 'Contact de test pour debug',
      isFavorite: false,
      locations: [
        {
          id: 'location_1',
          country: 'France',
          region: 'Paris',
          isLocalResident: true,
          hasVehicle: false,
          isHoused: true,
          isPrimary: true,
        },
        {
          id: 'location_2',
          country: 'France',
          region: 'Lyon',
          isLocalResident: false,
          hasVehicle: true,
          isHoused: false,
          isPrimary: false,
        }
      ]
    };
  }

  static createTestProfile(): UserProfile {
    return {
      firstName: 'Marie',
      lastName: 'Martin',
      jobTitle: 'Chef opératrice',
      phoneNumber: '+33987654321',
      email: 'marie.martin@example.com',
      isFavorite: false,
      locations: [
        {
          id: 'profile_location_1',
          country: 'France',
          region: 'Marseille',
          isLocalResident: true,
          hasVehicle: true,
          isHoused: true,
          isPrimary: true,
        }
      ]
    };
  }

  // Générer et tester un QR code
  static testQRGeneration(): void {
    console.log('🧪 Test génération QR Code');
    
    // Test contact
    const testContact = this.createTestContact();
    const contactQR = QRCodeService.generateContactQRData(testContact);
    
    console.log('📱 QR Contact généré:');
    console.log('Length:', contactQR.length);
    console.log('First 100 chars:', contactQR.substring(0, 100));
    
    // Test profile
    const testProfile = this.createTestProfile();
    const profileQR = QRCodeService.generateProfileQRData(testProfile);
    
    console.log('📱 QR Profile généré:');
    console.log('Length:', profileQR.length);
    console.log('First 100 chars:', profileQR.substring(0, 100));
  }

  // Tester le parsing d'un QR code
  static testQRParsing(): void {
    console.log('🧪 Test parsing QR Code');
    
    // Créer un QR valide
    const testContact = this.createTestContact();
    const qrData = QRCodeService.generateContactQRData(testContact);
    
    console.log('📄 QR Data original:', qrData);
    
    // Tester la validation
    const isValid = QRCodeService.isMyCyewQRCode(qrData);
    console.log('✅ QR valide:', isValid);
    
    // Tester le parsing
    const parsedContact = QRCodeService.parseQRData(qrData);
    console.log('📋 Contact parsé:', parsedContact);
    
    // Tester les infos preview
    const previewInfo = QRCodeService.getQRPreviewInfo(qrData);
    console.log('👁️ Preview info:', previewInfo);
  }

  // Tester différents formats invalides
  static testInvalidQRCodes(): void {
    console.log('🧪 Test QR codes invalides');
    
    const invalidCodes = [
      '', // Vide
      'invalid json', // JSON invalide
      '{"type": "invalid"}', // Type incorrect
      '{"type": "MyCrew_Contact", "version": "2.0"}', // Version incorrecte
      '{"type": "MyCrew_Contact", "version": "1.0", "data": null}', // Data null
      '{"type": "MyCrew_Contact", "version": "1.0", "data": {"firstName": ""}}', // Data incomplète
    ];

    invalidCodes.forEach((code, index) => {
      console.log(`\n❌ Test ${index + 1}:`, code);
      
      const isValid = QRCodeService.isMyCyewQRCode(code);
      console.log('Valid:', isValid);
      
      if (isValid) {
        const parsed = QRCodeService.parseQRData(code);
        console.log('Parsed:', parsed);
      }
    });
  }

  // Tester la performance avec de gros QR codes
  static testPerformance(): void {
    console.log('🧪 Test performance');
    
    // Créer un contact avec beaucoup de données
    const bigContact: Contact = {
      ...this.createTestContact(),
      notes: 'A'.repeat(1000), // Notes très longues
      locations: Array.from({ length: 10 }, (_, i) => ({
        id: `location_${i}`,
        country: `Country${i}`,
        region: `Region${i}`,
        isLocalResident: i % 2 === 0,
        hasVehicle: i % 3 === 0,
        isHoused: i % 4 === 0,
        isPrimary: i === 0,
      }))
    };

    console.time('QR Generation');
    const qrData = QRCodeService.generateContactQRData(bigContact);
    console.timeEnd('QR Generation');
    
    console.log('📏 QR Size:', qrData.length, 'characters');
    
    console.time('QR Validation');
    const isValid = QRCodeService.isMyCyewQRCode(qrData);
    console.timeEnd('QR Validation');
    
    console.time('QR Parsing');
    const parsed = QRCodeService.parseQRData(qrData);
    console.timeEnd('QR Parsing');
    
    console.log('✅ Big QR valid:', isValid);
    console.log('📊 Parsed locations count:', parsed?.locations.length);
  }

  // Tester les données edge cases
  static testEdgeCases(): void {
    console.log('🧪 Test edge cases');
    
    const edgeCases: Partial<Contact>[] = [
      {
        firstName: '',
        lastName: '',
        jobTitle: '',
        phone: '',
        email: '',
        notes: '',
        locations: [],
      },
      {
        firstName: 'A'.repeat(100),
        lastName: 'B'.repeat(100),
        jobTitle: 'C'.repeat(100),
        phone: '+33123456789',
        email: 'test@example.com',
      },
      {
        firstName: 'Jean-François',
        lastName: "O'Connor",
        jobTitle: 'Réalisateur & Producteur',
        phone: '+33 1 23 45 67 89',
        email: 'jean-francois.o-connor+work@example.com',
      },
      {
        firstName: 'José',
        lastName: 'García',
        jobTitle: 'Cadreur/Monteur',
        phone: '123',
        email: 'invalid-email',
      },
    ];

    edgeCases.forEach((contactData, index) => {
      console.log(`\n🔍 Edge case ${index + 1}:`);
      
      const contact: Contact = {
        id: `edge_${index}`,
        firstName: contactData.firstName || '',
        lastName: contactData.lastName || '',
        jobTitle: contactData.jobTitle || '',
        phone: contactData.phone || '',
        email: contactData.email || '',
        notes: contactData.notes || '',
        isFavorite: false,
        locations: contactData.locations || [],
      };

      try {
        const qrData = QRCodeService.generateContactQRData(contact);
        console.log('✅ QR généré, taille:', qrData.length);
        
        const isValid = QRCodeService.isMyCyewQRCode(qrData);
        console.log('✅ QR valide:', isValid);
        
        if (isValid) {
          const parsed = QRCodeService.parseQRData(qrData);
          console.log('✅ QR parsé:', parsed ? 'Succès' : 'Échec');
        }
      } catch (error) {
        console.log('❌ Erreur:', error);
      }
    });
  }

  // Créer des QR codes de test dans le format actuel
  static generateTestQRCodes(): string[] {
    const testCodes = [
      // QR contact simple
      QRCodeService.generateContactQRData(this.createTestContact()),
      
      // QR profile simple
      QRCodeService.generateProfileQRData(this.createTestProfile()),
      
      // QR contact minimal
      QRCodeService.generateContactQRData({
        id: 'minimal',
        firstName: 'Test',
        lastName: 'User',
        jobTitle: 'Actor',
        phone: '123',
        email: 'test@test.com',
        notes: '',
        isFavorite: false,
        locations: [{
          id: '1',
          country: 'France',
          region: 'Paris',
          isLocalResident: true,
          hasVehicle: false,
          isHoused: true,
          isPrimary: true,
        }],
      }),
    ];
    
    console.log('🎯 QR codes de test générés:');
    testCodes.forEach((code, index) => {
      console.log(`\n📱 QR ${index + 1} (${code.length} chars):`);
      console.log(code);
      console.log('---');
    });
    
    return testCodes;
  }

  // Exécuter tous les tests
  static runAllTests(): void {
    console.log('🚀 === DÉBUT DES TESTS QR CODE ===');
    
    try {
      this.testQRGeneration();
      console.log('\n');
      
      this.testQRParsing();
      console.log('\n');
      
      this.testInvalidQRCodes();
      console.log('\n');
      
      this.testPerformance();
      console.log('\n');
      
      this.testEdgeCases();
      console.log('\n');
      
      this.generateTestQRCodes();
      
    } catch (error) {
      console.error('❌ Erreur durant les tests:', error);
    }
    
    console.log('\n🏁 === FIN DES TESTS QR CODE ===');
  }

  // Validation des QR codes pour debugging en live
  static validateQRCode(qrString: string): {
    isValid: boolean;
    type: string;
    errors: string[];
    data?: any;
  } {
    const result = {
      isValid: false,
      type: 'unknown',
      errors: [] as string[],
      data: undefined as any,
    };

    if (!qrString) {
      result.errors.push('QR code vide');
      return result;
    }

    try {
      const parsed = JSON.parse(qrString);
      result.data = parsed;
      
      if (!parsed.type) {
        result.errors.push('Type manquant');
        return result;
      }
      
      result.type = parsed.type;
      
      if (parsed.type !== 'MyCrew_Contact') {
        result.errors.push(`Type incorrect: ${parsed.type}, attendu: MyCrew_Contact`);
        return result;
      }
      
      if (!parsed.version) {
        result.errors.push('Version manquante');
        return result;
      }
      
      if (parsed.version !== '1.0') {
        result.errors.push(`Version incorrecte: ${parsed.version}, attendu: 1.0`);
        return result;
      }
      
      if (!parsed.data) {
        result.errors.push('Data manquante');
        return result;
      }
      
      const data = parsed.data;
      const requiredFields = ['firstName', 'lastName', 'jobTitle', 'phone', 'email'];
      
      for (const field of requiredFields) {
        if (typeof data[field] !== 'string') {
          result.errors.push(`Champ ${field} manquant ou incorrect`);
        }
      }
      
      if (data.locations && !Array.isArray(data.locations)) {
        result.errors.push('Locations doit être un array');
      }
      
      if (result.errors.length === 0) {
        result.isValid = true;
      }
      
    } catch (error) {
      result.errors.push(`JSON invalide: ${error}`);
    }

    return result;
  }
}

// Fonction helper pour debugger dans la console
export const debugQR = QRDebugger;