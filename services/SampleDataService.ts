// MyCrew React Native - Sample Data Service
// Seeds database with sample contacts for testing

import { DatabaseService } from './DatabaseService';
import { Contact } from '../types';

export class SampleDataService {
  static async seedDatabase(): Promise<void> {
    const db = DatabaseService.getInstance();
    
    // Check if we already have contacts
    const contactCount = await db.getContactCount();
    if (contactCount >= 20) {
      console.log('Database already has 20+ contacts, skipping seed');
      return;
    }
    
    // If we have some contacts but not 20, clear and re-seed to ensure consistency
    if (contactCount > 0) {
      console.log(`Database has ${contactCount} contacts, clearing to re-seed with all 20`);
      await db.clearAllContacts();
    }

    console.log('Seeding database with sample data...');

    const sampleContacts: Omit<Contact, 'id'>[] = [
      {
        firstName: 'Marie',
        lastName: 'Dubois',
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
        firstName: 'Jean-Luc',
        lastName: 'Martin',
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
        firstName: 'Sophie',
        lastName: 'Laurent',
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
        firstName: 'Pierre',
        lastName: 'Moreau',
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
        firstName: 'Camille',
        lastName: 'Petit',
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
        firstName: 'Alexandre',
        lastName: 'Roux',
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
        firstName: 'Julie',
        lastName: 'Blanc',
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
        firstName: 'Thomas',
        lastName: 'Girard',
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
      },
      {
        firstName: 'Anaïs',
        lastName: 'Rousseau',
        jobTitle: 'Script',
        phone: '+33 6 87 65 43 21',
        email: 'anais.rousseau@script.fr',
        notes: 'Précise et organisée. Expérience séries TV.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Bretagne',
            isLocalResident: true,
            hasVehicle: false,
            isHoused: false,
            isPrimary: true
          }
        ]
      },
      {
        firstName: 'Benoît',
        lastName: 'Fournier',
        jobTitle: 'Cadreur',
        phone: '+33 6 11 22 33 44',
        email: 'benoit.fournier@cadrage.fr',
        notes: 'Steadicam et drone. Très mobile.',
        isFavorite: true,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Normandie',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: true,
            isPrimary: true
          }
        ]
      },
      {
        firstName: 'Clara',
        lastName: 'Mercier',
        jobTitle: 'Maquilleuse',
        phone: '+33 6 55 66 77 88',
        email: 'clara.mercier@maquillage.fr',
        notes: 'Spécialiste FX et beauté. Portfolio sur demande.',
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
        firstName: 'David',
        lastName: 'Leroy',
        jobTitle: 'Producteur',
        phone: '+33 6 99 88 77 66',
        email: 'david.leroy@prod.fr',
        notes: 'Films et documentaires. Réseau international.',
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
            country: 'Canada',
            region: 'Québec',
            isLocalResident: false,
            hasVehicle: false,
            isHoused: true,
            isPrimary: false
          }
        ]
      },
      {
        firstName: 'Élodie',
        lastName: 'Simon',
        jobTitle: 'Costumière',
        phone: '+33 6 22 33 44 55',
        email: 'elodie.simon@costume.fr',
        notes: 'Créations originales et costumes d\'époque.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Grand Est',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: false,
            isPrimary: true
          }
        ]
      },
      {
        firstName: 'Fabien',
        lastName: 'Durand',
        jobTitle: 'Chef Machiniste',
        phone: '+33 6 33 44 55 66',
        email: 'fabien.durand@machinisme.fr',
        notes: 'Grue et travelling. Équipe expérimentée.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Hauts-de-France',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: true,
            isPrimary: true
          }
        ]
      },
      {
        firstName: 'Gabrielle',
        lastName: 'Moreau',
        jobTitle: 'Assistante Réalisatrice',
        phone: '+33 6 44 55 66 77',
        email: 'gabrielle.moreau@assist.fr',
        notes: 'Bilingue anglais-français. Tournages internationaux.',
        isFavorite: true,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Provence-Alpes-Côte d\'Azur',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: false,
            isPrimary: true
          }
        ]
      },
      {
        firstName: 'Hugo',
        lastName: 'Lemaire',
        jobTitle: 'Directeur Photo',
        phone: '+33 6 66 77 88 99',
        email: 'hugo.lemaire@photo.fr',
        notes: 'Spécialiste documentaires nature. Matériel 4K.',
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
        firstName: 'Inès',
        lastName: 'Fabre',
        jobTitle: 'Réalisatrice',
        phone: '+33 6 77 88 99 00',
        email: 'ines.fabre@real.fr',
        notes: 'Courts-métrages primés. Style artistique unique.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Occitanie',
            isLocalResident: true,
            hasVehicle: false,
            isHoused: false,
            isPrimary: true
          }
        ]
      },
      {
        firstName: 'Julien',
        lastName: 'Barbier',
        jobTitle: 'Perchman',
        phone: '+33 6 88 99 00 11',
        email: 'julien.barbier@son.fr',
        notes: 'Son direct professionnel. Matériel Sennheiser.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Centre-Val de Loire',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: true,
            isPrimary: true
          }
        ]
      },
      {
        firstName: 'Karine',
        lastName: 'Vidal',
        jobTitle: 'Monteuse Son',
        phone: '+33 6 00 11 22 33',
        email: 'karine.vidal@postprod.fr',
        notes: 'Pro Tools expert. Studio équipé.',
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
        firstName: 'Laurent',
        lastName: 'Carre',
        jobTitle: 'Étalonneur',
        phone: '+33 6 11 00 99 88',
        email: 'laurent.carre@color.fr',
        notes: 'DaVinci Resolve Studio. Look créatif.',
        isFavorite: false,
        locations: [
          {
            id: '',
            country: 'France',
            region: 'Pays de la Loire',
            isLocalResident: true,
            hasVehicle: true,
            isHoused: false,
            isPrimary: true
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