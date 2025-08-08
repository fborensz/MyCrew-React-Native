// MyCrew React Native - Sample Data Service
// Seeds database with sample contacts for testing

import { DatabaseService } from './DatabaseService';
import { Contact } from '../types';

export class SampleDataService {
  static async seedDatabase(): Promise<void> {
    const db = DatabaseService.getInstance();
    
    // Check if we already have contacts
    const contactCount = await db.getContactCount();
    if (contactCount > 0) {
      console.log('Database already has contacts, skipping seed');
      return;
    }

    console.log('Seeding database with sample data...');

    const sampleContacts: Omit<Contact, 'id'>[] = [
      {
        name: 'Marie Dubois',
        jobTitle: 'Réalisatrice',
        phone: '+33 6 12 34 56 78',
        email: 'marie.dubois@cinema.fr',
        notes: 'Spécialisée dans les films dramatiques. Très professionnelle et créative.',
        isFavorite: true,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Île-de-France',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: false,
            isPrimary: true
          },
          {
            id: '',
            country: 'France',
            region: 'Provence-Alpes-Côte d\'Azur',
            isLocalResident: false,
            hasVehicle: false,
            isHoused: true,
            isPrimary: false
          }
        ]
      },
      {
        name: 'Jean-Luc Martin',
        jobTitle: 'Chef opérateur',
        phone: '+33 6 98 76 54 32',
        email: 'jl.martin@image.fr',
        notes: 'Excellent avec les caméras RED. Disponible pour tournages internationaux.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Auvergne-Rhône-Alpes',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: true,
            isPrimary: true
          }
        ]
      },
      {
        name: 'Sophie Laurent',
        jobTitle: 'Ingénieur du Son',
        phone: '+33 6 45 67 89 12',
        email: 'sophie.laurent@audio.fr',
        notes: 'Spécialiste du son direct et post-production. Matériel professionnel.',
        isFavorite: true,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Île-de-France',
            isLocalResident: true,
            hasVehicle: false,
            isHoused: false,
            isPrimary: true
          }
        ]
      },
      {
        name: 'Pierre Moreau',
        jobTitle: '1er Assistant Réalisateur',
        phone: '+33 6 23 45 67 89',
        email: 'p.moreau@assistance.fr',
        notes: 'Très organisé, excellente gestion d\'équipe. Références sur demande.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Nouvelle-Aquitaine',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: true,
            isPrimary: true
          },
          {
            id: '',
            country: 'Belgique',
            region: 'Bruxelles-Capitale',
            isLocalResident: false,
            hasVehicle: false,
            isHoused: false,
            isPrimary: false
          }
        ]
      },
      {
        name: 'Camille Petit',
        jobTitle: 'Chef Décorateur',
        phone: '+33 6 78 90 12 34',
        email: 'camille.petit@decor.fr',
        notes: 'Créative et précise. Spécialiste des décors d\'époque.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Occitanie',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: false,
            isPrimary: true
          }
        ]
      },
      {
        name: 'Alexandre Roux',
        jobTitle: 'Chef Électro (Gaffer)',
        phone: '+33 6 56 78 90 12',
        email: 'alex.roux@lumiere.fr',
        notes: 'Matériel LED dernière génération. Équipe disponible.',
        isFavorite: true,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Provence-Alpes-Côte d\'Azur',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: true,
            isPrimary: true
          }
        ]
      },
      {
        name: 'Julie Blanc',
        jobTitle: 'Monteuse',
        phone: '+33 6 34 56 78 90',
        email: 'julie.blanc@montage.fr',
        notes: 'Avid et DaVinci Resolve. Rapide et créative.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Île-de-France',
            isLocalResident: true,
            hasVehicle: false,
            isHoused: false,
            isPrimary: true
          }
        ]
      },
      {
        name: 'Thomas Girard',
        jobTitle: 'Régisseur Général',
        phone: '+33 6 12 90 78 56',
        email: 't.girard@regie.fr',
        notes: 'Expérience internationale. Gestion budgets importants.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Île-de-France',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: false,
            isPrimary: true
          },
          {
            id: '',
            country: 'États-Unis',
            region: 'Côte Ouest',
            isLocalResident: false,
            hasVehicle: false,
            isHoused: false,
            isPrimary: false
          }
        ]
      }
    ];

    try {
      for (const contact of sampleContacts) {
        await db.createContact(contact);
      }
      console.log(`Successfully seeded ${sampleContacts.length} sample contacts`);
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}