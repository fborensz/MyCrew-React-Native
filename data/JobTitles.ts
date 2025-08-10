// MyCrew React Native - Job Titles System (Updated)
// Version inclusive avec métiers additionnels pour l'industrie du cinéma français

import { Department } from '../types';

export class JobTitles {
  // Special job for imports (not visible in UI picker)
  static readonly DEFAULT_JOB = "À définir";
  
  static readonly departments: Record<string, string[]> = {
    "Mise en scène": [
      "Réalisateur.ice",
      "1er.ère Assistant.e Réalisateur.ice",
      "2e Assistant.e Réalisateur.ice", 
      "3e Assistant.e Réalisateur.ice",
      "Scripte",
      "Directeur.ice de casting",
      "Assistant.e casting",
      "Coach acteur.ice",
      "Répétiteur.ice"
    ],
    "Image": [
      "Directeur.ice de la photographie",
      "Chef.fe opérateur.ice",
      "Cadreur.se",
      "Opérateur.ice Steadicam",
      "Opérateur.ice Louma",
      "Opérateur.ice drone",
      "1er.ère Assistant.e Caméra (Focus Puller)",
      "2e Assistant.e Caméra (Clap/Loader)",
      "3e Assistant.e Caméra",
      "Vidéo Assist",
      "DIT (Digital Imaging Technician)",
      "Data Manager",
      "Étalonneur.se plateau"
    ],
    "Son": [
      "Ingénieur.e du Son",
      "Chef.fe opérateur.ice Son",
      "Perchman.woman",
      "Assistant.e Son",
      "Sound Designer",
      "Monteur.se Son",
      "Mixeur.se",
      "Bruiteur.se",
      "Musicien.ne plateau"
    ],
    "Lumière": [
      "Chef.fe Électro (Gaffer)",
      "Électricien.ne",
      "Chef.fe Machiniste (Key Grip)",
      "Machiniste",
      "Rigger",
      "Groupman",
      "Poursuiteur.se"
    ],
    "Régie": [
      "Régisseur.se Général.e",
      "Régisseur.se Adjoint.e",
      "Régisseur.se",
      "Assistant.e Régie",
      "Régisseur.se Transport",
      "Régisseur.se Plateau",
      "Régisseur.se Extérieurs",
      "Repéreur.se",
      "Location Manager"
    ],
    "Décors": [
      "Chef.fe Décorateur.ice",
      "1er.ère Assistant.e Décorateur.ice",
      "2e Assistant.e Décorateur.ice",
      "Ensemblier.ère",
      "Accessoiriste",
      "Peintre Décor",
      "Sculpteur.ice Décor",
      "Constructeur.ice Décor",
      "Menuisier.ère Décor",
      "Serrurier.ère Décor",
      "Staffeur.se",
      "Tapissier.ère Décor"
    ],
    "Costumes": [
      "Chef.fe Costumier.ère",
      "Créateur.ice de costumes",
      "Assistant.e Costumier.ère",
      "Habilleur.se",
      "Couturier.ère",
      "Modiste",
      "Bottier.ère",
      "Lingère"
    ],
    "Maquillage et Coiffure": [
      "Chef.fe Maquilleur.se",
      "Maquilleur.se",
      "Assistant.e Maquilleur.se",
      "Maquilleur.se SFX",
      "Prothésiste",
      "Chef.fe Coiffeur.se",
      "Coiffeur.se",
      "Perruquier.ère",
      "Barbier.ère plateau"
    ],
    "Production": [
      "Producteur.ice",
      "Producteur.ice Exécutif.ve",
      "Producteur.ice Délégué.e",
      "Directeur.ice de Production",
      "Assistant.e de Production",
      "Administrateur.ice de Production",
      "Secrétaire de Production",
      "Comptable de Production",
      "Chargé.e de production"
    ],
    "Post-Production": [
      "Monteur.se Image",
      "Chef.fe Monteur.se",
      "Assistant.e Monteur.se",
      "Étalonneur.se",
      "Superviseur.e VFX",
      "Coordinateur.ice VFX",
      "Artiste VFX",
      "Compositeur.ice VFX",
      "Motion Designer",
      "Graphiste 2D/3D",
      "Truquiste",
      "Conformateur.ice"
    ],
    "Effets Spéciaux": [
      "Superviseur.e SFX",
      "Technicien.ne SFX",
      "Artificier.ère",
      "Mécanicien.ne SFX",
      "Coordinateur.ice SFX"
    ],
    "Cascades et Sécurité": [
      "Cascadeur.se",
      "Coordinateur.ice Cascades",
      "Doublure",
      "Conseiller.ère Sécurité",
      "Armurier.ère",
      "Conducteur.ice de jeu"
    ],
    "Autres Spécialités": [
      "Dresseur.se Animalier.ère",
      "Photographe de Plateau",
      "Vidéaste Making-of",
      "Chef.fe Cuisinier.ère Plateau",
      "Assistant.e Cuisinier.ère",
      "Médecin de plateau",
      "Infirmier.ère de plateau",
      "Garde d'enfants plateau",
      "Coach sportif.ve",
      "Chorégraphe",
      "Maître.sse d'armes",
      "Consultant.e technique",
      "Interprète",
      "Sous-titreur.se"
    ]
  };

  // Department icons mapping (using Expo vector icons)
  static readonly departmentIcons: Record<string, string> = {
    "Mise en scène": "film-outline",
    "Image": "camera",
    "Son": "mic",
    "Lumière": "bulb",
    "Régie": "construct",
    "Décors": "build",
    "Costumes": "shirt",
    "Maquillage et Coiffure": "color-palette",
    "Production": "briefcase",
    "Post-Production": "laptop",
    "Effets Spéciaux": "sparkles",
    "Cascades et Sécurité": "shield",
    "Autres Spécialités": "ellipsis-horizontal-circle"
  };

  // Get all available jobs for interface (excludes DEFAULT_JOB)
  static get allAvailableJobs(): string[] {
    return Object.values(this.departments)
      .flat()
      .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
  }

  // Get all jobs including DEFAULT_JOB for validation
  static get allJobs(): string[] {
    return [this.DEFAULT_JOB, ...this.allAvailableJobs];
  }

  // Get departments as array of Department objects
  static get departmentsList(): Department[] {
    return Object.entries(this.departments).map(([name, jobs]) => ({
      name,
      jobs: jobs.sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
    }));
  }

  // Check if a job is valid (includes DEFAULT_JOB)
  static isValidJob(job: string): boolean {
    return job === this.DEFAULT_JOB || this.allAvailableJobs.includes(job);
  }

  // Get department for a specific job
  static getDepartmentForJob(job: string): string | undefined {
    for (const [department, jobs] of Object.entries(this.departments)) {
      if (jobs.includes(job)) {
        return department;
      }
    }
    return undefined;
  }

  // Get jobs for a specific department
  static getJobsForDepartment(department: string): string[] {
    return this.departments[department] || [];
  }

  // Get icon for a specific department
  static getIconForDepartment(department: string): string {
    return this.departmentIcons[department] || 'help-circle';
  }

  // Search jobs by text
  static searchJobs(query: string): string[] {
    if (!query.trim()) return this.allAvailableJobs;
    
    const normalizedQuery = query.toLowerCase().trim();
    return this.allAvailableJobs.filter(job => 
      job.toLowerCase().includes(normalizedQuery)
    );
  }

  // Get job statistics
  static getStatistics() {
    const departmentCount = Object.keys(this.departments).length;
    const totalJobs = this.allAvailableJobs.length;
    const jobsByDepartment = Object.entries(this.departments).map(([dept, jobs]) => ({
      department: dept,
      count: jobs.length
    }));

    return {
      departmentCount,
      totalJobs,
      jobsByDepartment
    };
  }
}

// Export compatible avec l'ancien format pour les écrans
export const FILM_DEPARTMENTS: Department[] = Object.keys(JobTitles.departments).map(name => ({
  name,
  jobs: JobTitles.departments[name]
}));