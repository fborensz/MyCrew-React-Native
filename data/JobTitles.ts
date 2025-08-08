// MyCrew React Native - Job Titles System
// Based on JobTitles.swift - Complete French film industry job database

import { Department } from '../types';

export class JobTitles {
  // Special job for imports (not visible in UI picker)
  static readonly DEFAULT_JOB = "À définir";
  
  static readonly departments: Record<string, string[]> = {
    "Réalisation": [
      "Réalisateur",
      "1er Assistant Réalisateur",
      "2e Assistant Réalisateur",
      "3e Assistant Réalisateur",
      "Scripte"
    ],
    "Image": [
      "Directeur de la photographie",
      "Chef opérateur",
      "Cadreur",
      "Opérateur Steadicam",
      "Opérateur Louma",
      "1er Assistant Caméra (Focus Puller)",
      "2e Assistant Caméra (Clap/Loader)",
      "3e Assistant Caméra",
      "Vidéo Assist",
      "DIT (Digital Imaging Technician)",
      "Data Manager"
    ],
    "Son": [
      "Ingénieur du Son",
      "Perchman",
      "Assistant Son",
      "Sound Designer",
      "Monteur Son",
      "Mixeur"
    ],
    "Lumière": [
      "Chef Électro (Gaffer)",
      "Électro",
      "Chef Machiniste (Key Grip)",
      "Machiniste",
      "Rigger"
    ],
    "Régie": [
      "Régisseur Général",
      "Régisseur Adjoint",
      "Régisseur",
      "Assistant Régie",
      "Régisseur Transport",
      "Régisseur Plateau"
    ],
    "Décors": [
      "Chef Décorateur",
      "Assistant Décorateur",
      "Ensemblière",
      "Accessoiriste",
      "Peintre Décor",
      "Constructeur Décor",
      "Menuisier Décor",
      "Habilleur de Décor"
    ],
    "Costumes": [
      "Chef Costumier",
      "Assistant Costumier",
      "Habilleur",
      "Styliste",
      "Costumier"
    ],
    "Maquillage et Coiffure": [
      "Chef Maquilleur",
      "Maquilleur",
      "Assistant Maquilleur",
      "Chef Coiffeur",
      "Coiffeur",
      "Perruquier"
    ],
    "Production": [
      "Producteur",
      "Directeur de Production",
      "Assistant de Production",
      "Administrateur de Production",
      "Secrétaire de Production"
    ],
    "Post-Production": [
      "Monteur Image",
      "Assistant Monteur",
      "Étalonneur",
      "Superviseur VFX",
      "Graphiste VFX",
      "Motion Designer"
    ],
    "Autres Spécialités": [
      "Cascadeur",
      "Coordinateur Stunts",
      "Dresseur Animalier",
      "Photographe de Plateau",
      "Making-of",
      "Chef Cuisinier Plateau"
    ]
  };

  // Department icons mapping (using Expo vector icons)
  static readonly departmentIcons: Record<string, string> = {
    "Réalisation": "movie-open",
    "Image": "camera",
    "Son": "microphone",
    "Lumière": "lightbulb-on",
    "Régie": "clipboard-list",
    "Décors": "palette",
    "Costumes": "tshirt-crew",
    "Maquillage et Coiffure": "face-woman",
    "Production": "briefcase",
    "Post-Production": "video-edit",
    "Autres Spécialités": "star-circle"
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