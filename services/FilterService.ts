// MyCrew React Native - Filter Service
// Service réutilisable pour appliquer les filtres aux contacts

import { Contact } from '../types';

interface FilterOptions {
  job: string | null;
  country: string | null;
  regions: string[];
  isHoused: boolean;
  isLocalResident: boolean;
  hasVehicle: boolean;
}

export class FilterService {
  
  /**
   * Applique tous les filtres à une liste de contacts
   */
  static applyFilters(contacts: Contact[], filters: FilterOptions): Contact[] {
    let filtered = [...contacts];

    // Filtre par métier
    if (filters.job && filters.job !== 'Tous') {
      filtered = filtered.filter(contact => 
        contact.jobTitle.toLowerCase().includes(filters.job!.toLowerCase())
      );
    }

    // Filtre par pays
    if (filters.country && filters.country !== 'Tous') {
      if (filters.country === 'Worldwide') {
        // Worldwide = tous les contacts
        // Pas de filtrage supplémentaire
      } else {
        filtered = filtered.filter(contact => 
          contact.locations.some(location => 
            location.country === filters.country
          )
        );
      }
    }

    // Filtre par régions françaises
    if (filters.regions.length > 0) {
      filtered = filtered.filter(contact =>
        contact.locations.some(location =>
          location.country === 'France' && 
          filters.regions.includes(location.region || '')
        )
      );
    }

    // Filtre par attributs de logement
    if (filters.isHoused) {
      filtered = filtered.filter(contact =>
        contact.locations.some(location => location.isHoused)
      );
    }

    // Filtre par résidence fiscale
    if (filters.isLocalResident) {
      filtered = filtered.filter(contact =>
        contact.locations.some(location => location.isLocalResident)
      );
    }

    // Filtre par véhicule
    if (filters.hasVehicle) {
      filtered = filtered.filter(contact =>
        contact.locations.some(location => location.hasVehicle)
      );
    }

    return filtered;
  }

  /**
   * Applique la recherche textuelle
   */
  static applySearch(contacts: Contact[], searchText: string): Contact[] {
    if (!searchText.trim()) return contacts;

    const searchLower = searchText.toLowerCase().trim();
    return contacts.filter(contact => {
      try {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          (contact.jobTitle && contact.jobTitle.toLowerCase().includes(searchLower)) ||
          (contact.phone && contact.phone.includes(searchText.trim())) ||
          (contact.email && contact.email.toLowerCase().includes(searchLower))
        );
      } catch (error) {
        console.error('Search filter error for contact:', contact, error);
        return false;
      }
    });
  }

  /**
   * Applique tous les filtres ET la recherche
   */
  static applyAllFilters(
    contacts: Contact[], 
    filters: FilterOptions, 
    searchText: string = ''
  ): Contact[] {
    // D'abord appliquer les filtres
    let filtered = this.applyFilters(contacts, filters);
    
    // Puis appliquer la recherche
    filtered = this.applySearch(filtered, searchText);
    
    return filtered;
  }

  /**
   * Vérifie si des filtres sont actifs
   */
  static hasActiveFilters(filters: FilterOptions): boolean {
    return !!(
      (filters.job && filters.job !== 'Tous') ||
      (filters.country && filters.country !== 'Tous') ||
      filters.regions.length > 0 ||
      filters.isHoused ||
      filters.isLocalResident ||
      filters.hasVehicle
    );
  }

  /**
   * Compte le nombre de contacts correspondant aux filtres
   */
  static getFilteredCount(contacts: Contact[], filters: FilterOptions): number {
    return this.applyFilters(contacts, filters).length;
  }
}