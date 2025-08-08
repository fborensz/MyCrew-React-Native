// Complete geographic data from Swift app analysis
// 19 countries with French regions and major cities

export interface Country {
  name: string;
  regions?: Region[];
}

export interface Region {
  name: string;
  cities: string[];
}

// French regions with major cities (13 regions from Swift app)
export const FRENCH_REGIONS: Region[] = [
  {
    name: 'Île-de-France',
    cities: ['Paris', 'Versailles', 'Saint-Denis', 'Boulogne-Billancourt', 'Nanterre']
  },
  {
    name: 'Provence-Alpes-Côte d\'Azur',
    cities: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon', 'Antibes', 'Cannes']
  },
  {
    name: 'Auvergne-Rhône-Alpes',
    cities: ['Lyon', 'Grenoble', 'Saint-Étienne', 'Villeurbanne', 'Clermont-Ferrand', 'Annecy']
  },
  {
    name: 'Nouvelle-Aquitaine',
    cities: ['Bordeaux', 'Limoges', 'Poitiers', 'Pau', 'La Rochelle', 'Angoulême']
  },
  {
    name: 'Occitanie',
    cities: ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers', 'Carcassonne']
  },
  {
    name: 'Hauts-de-France',
    cities: ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Calais', 'Dunkerque']
  },
  {
    name: 'Grand Est',
    cities: ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy', 'Colmar']
  },
  {
    name: 'Pays de la Loire',
    cities: ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire', 'Cholet', 'Laval']
  },
  {
    name: 'Bretagne',
    cities: ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Brieuc']
  },
  {
    name: 'Normandie',
    cities: ['Rouen', 'Le Havre', 'Caen', 'Cherbourg', 'Évreux', 'Alençon']
  },
  {
    name: 'Bourgogne-Franche-Comté',
    cities: ['Dijon', 'Besançon', 'Belfort', 'Chalon-sur-Saône', 'Auxerre', 'Mâcon']
  },
  {
    name: 'Centre-Val de Loire',
    cities: ['Orléans', 'Tours', 'Bourges', 'Blois', 'Chartres', 'Châteauroux']
  },
  {
    name: 'Corse',
    cities: ['Ajaccio', 'Bastia', 'Porto-Vecchio', 'Calvi', 'Corte', 'Bonifacio']
  }
];

// All countries including France with regions (19 countries from Swift app)
export const COUNTRIES: Country[] = [
  {
    name: 'France',
    regions: FRENCH_REGIONS
  },
  {
    name: 'Belgique',
    regions: [
      {
        name: 'Bruxelles-Capitale',
        cities: ['Bruxelles']
      },
      {
        name: 'Flandre',
        cities: ['Anvers', 'Gand', 'Bruges', 'Louvain']
      },
      {
        name: 'Wallonie',
        cities: ['Liège', 'Charleroi', 'Namur', 'Mons']
      }
    ]
  },
  {
    name: 'Suisse',
    regions: [
      {
        name: 'Suisse romande',
        cities: ['Genève', 'Lausanne', 'Neuchâtel', 'Fribourg']
      },
      {
        name: 'Suisse alémanique',
        cities: ['Zurich', 'Berne', 'Bâle', 'Lucerne']
      }
    ]
  },
  {
    name: 'Italie',
    regions: [
      {
        name: 'Nord',
        cities: ['Milan', 'Turin', 'Venise', 'Bologne']
      },
      {
        name: 'Centre',
        cities: ['Rome', 'Florence', 'Pise']
      },
      {
        name: 'Sud',
        cities: ['Naples', 'Palerme', 'Bari']
      }
    ]
  },
  {
    name: 'Espagne',
    regions: [
      {
        name: 'Principales',
        cities: ['Madrid', 'Barcelone', 'Valence', 'Séville', 'Bilbao']
      }
    ]
  },
  {
    name: 'Portugal',
    regions: [
      {
        name: 'Principales',
        cities: ['Lisbonne', 'Porto', 'Faro']
      }
    ]
  },
  {
    name: 'Royaume-Uni',
    regions: [
      {
        name: 'Angleterre',
        cities: ['Londres', 'Manchester', 'Birmingham', 'Liverpool']
      },
      {
        name: 'Écosse',
        cities: ['Édimbourg', 'Glasgow']
      },
      {
        name: 'Pays de Galles',
        cities: ['Cardiff']
      }
    ]
  },
  {
    name: 'Irlande',
    regions: [
      {
        name: 'Principales',
        cities: ['Dublin', 'Cork', 'Galway']
      }
    ]
  },
  {
    name: 'Allemagne',
    regions: [
      {
        name: 'Principales',
        cities: ['Berlin', 'Munich', 'Hambourg', 'Cologne', 'Francfort']
      }
    ]
  },
  {
    name: 'Autriche',
    regions: [
      {
        name: 'Principales',
        cities: ['Vienne', 'Salzbourg', 'Innsbruck']
      }
    ]
  },
  {
    name: 'Pays-Bas',
    regions: [
      {
        name: 'Principales',
        cities: ['Amsterdam', 'Rotterdam', 'La Haye', 'Utrecht']
      }
    ]
  },
  {
    name: 'États-Unis',
    regions: [
      {
        name: 'Côte Ouest',
        cities: ['Los Angeles', 'San Francisco', 'Seattle', 'Portland']
      },
      {
        name: 'Côte Est',
        cities: ['New York', 'Boston', 'Washington DC', 'Miami']
      },
      {
        name: 'Centre',
        cities: ['Chicago', 'Dallas', 'Denver', 'Las Vegas']
      }
    ]
  },
  {
    name: 'Canada',
    regions: [
      {
        name: 'Principales',
        cities: ['Montréal', 'Toronto', 'Vancouver', 'Ottawa', 'Québec']
      }
    ]
  },
  {
    name: 'Maroc',
    regions: [
      {
        name: 'Principales',
        cities: ['Casablanca', 'Rabat', 'Marrakech', 'Fès']
      }
    ]
  },
  {
    name: 'Tunisie',
    regions: [
      {
        name: 'Principales',
        cities: ['Tunis', 'Sfax', 'Sousse']
      }
    ]
  },
  {
    name: 'Sénégal',
    regions: [
      {
        name: 'Principales',
        cities: ['Dakar', 'Saint-Louis', 'Thiès']
      }
    ]
  },
  {
    name: 'République Tchèque',
    regions: [
      {
        name: 'Principales',
        cities: ['Prague', 'Brno']
      }
    ]
  },
  {
    name: 'Roumanie',
    regions: [
      {
        name: 'Principales',
        cities: ['Bucarest', 'Cluj-Napoca']
      }
    ]
  },
  {
    name: 'Worldwide',
    regions: [
      {
        name: 'International',
        cities: ['Mobile International']
      }
    ]
  }
];

// Helper functions
export const getCountryByName = (name: string): Country | undefined => {
  return COUNTRIES.find(country => country.name === name);
};

export const getRegionsForCountry = (countryName: string): Region[] => {
  const country = getCountryByName(countryName);
  return country?.regions || [];
};

export const getCitiesForRegion = (countryName: string, regionName: string): string[] => {
  const regions = getRegionsForCountry(countryName);
  const region = regions.find(r => r.name === regionName);
  return region?.cities || [];
};

// Get all country names
export const COUNTRY_NAMES = COUNTRIES.map(country => country.name);

// Create COUNTRIES_WITH_REGIONS structure for easy access
export const COUNTRIES_WITH_REGIONS: Record<string, string[]> = COUNTRIES.reduce((acc, country) => {
  acc[country.name] = country.regions?.map(region => region.name) || [];
  return acc;
}, {} as Record<string, string[]>);