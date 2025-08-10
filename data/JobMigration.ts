// MyCrew React Native - Job Migration System
// Mapping entre anciens et nouveaux noms de métiers pour la migration

export class JobMigration {
  // Mapping des anciens noms vers les nouveaux noms inclusifs
  private static readonly jobMapping: Record<string, string> = {
    // Mise en scène
    "Réalisateur": "Réalisateur.ice",
    "1er Assistant Réalisateur": "1er.ère Assistant.e Réalisateur.ice",
    "2e Assistant Réalisateur": "2e Assistant.e Réalisateur.ice",
    "3e Assistant Réalisateur": "3e Assistant.e Réalisateur.ice",
    
    // Image
    "Directeur de la photographie": "Directeur.ice de la photographie",
    "Chef opérateur": "Chef.fe opérateur.ice",
    "Cadreur": "Cadreur.se",
    "Opérateur Steadicam": "Opérateur.ice Steadicam",
    "Opérateur Louma": "Opérateur.ice Louma",
    "1er Assistant Caméra (Focus Puller)": "1er.ère Assistant.e Caméra (Focus Puller)",
    "2e Assistant Caméra (Clap/Loader)": "2e Assistant.e Caméra (Clap/Loader)",
    "3e Assistant Caméra": "3e Assistant.e Caméra",
    
    // Son
    "Ingénieur du Son": "Ingénieur.e du Son",
    "Monteur Son": "Monteur.se Son",
    "Mixeur": "Mixeur.se",
    
    // Lumière
    "Chef Électro (Gaffer)": "Chef.fe Électro (Gaffer)",
    "Électro": "Électricien.ne",
    "Chef Machiniste (Key Grip)": "Chef.fe Machiniste (Key Grip)",
    
    // Régie
    "Régisseur Général": "Régisseur.se Général.e",
    "Régisseur Adjoint": "Régisseur.se Adjoint.e",
    "Régisseur": "Régisseur.se",
    "Régisseur Transport": "Régisseur.se Transport",
    "Régisseur Plateau": "Régisseur.se Plateau",
    
    // Décors
    "Chef Décorateur": "Chef.fe Décorateur.ice",
    "Assistant Décorateur": "1er.ère Assistant.e Décorateur.ice",
    "Ensemblière": "Ensemblier.ère",
    "Constructeur Décor": "Constructeur.ice Décor",
    "Menuisier Décor": "Menuisier.ère Décor",
    
    // Costumes
    "Chef Costumier": "Chef.fe Costumier.ère",
    "Assistant Costumier": "Assistant.e Costumier.ère",
    "Habilleur": "Habilleur.se",
    "Costumier": "Chef.fe Costumier.ère",
    
    // Maquillage et Coiffure
    "Chef Maquilleur": "Chef.fe Maquilleur.se",
    "Maquilleur": "Maquilleur.se",
    "Assistant Maquilleur": "Assistant.e Maquilleur.se",
    "Chef Coiffeur": "Chef.fe Coiffeur.se",
    "Coiffeur": "Coiffeur.se",
    "Perruquier": "Perruquier.ère",
    
    // Production
    "Producteur": "Producteur.ice",
    "Directeur de Production": "Directeur.ice de Production",
    "Assistant de Production": "Assistant.e de Production",
    "Administrateur de Production": "Administrateur.ice de Production",
    
    // Post-Production
    "Monteur Image": "Monteur.se Image",
    "Assistant Monteur": "Assistant.e Monteur.se",
    "Étalonneur": "Étalonneur.se",
    "Superviseur VFX": "Superviseur.e VFX",
    "Graphiste VFX": "Artiste VFX",
    
    // Autres Spécialités
    "Cascadeur": "Cascadeur.se",
    "Coordinateur Stunts": "Coordinateur.ice Cascades",
    "Dresseur Animalier": "Dresseur.se Animalier.ère",
    "Making-of": "Vidéaste Making-of",
    "Chef Cuisinier Plateau": "Chef.fe Cuisinier.ère Plateau"
  };

  /**
   * Migre un ancien nom de métier vers le nouveau nom inclusif
   * @param oldJobTitle L'ancien nom du métier
   * @returns Le nouveau nom inclusif ou l'ancien nom si pas de mapping trouvé
   */
  static migrateJobTitle(oldJobTitle: string): string {
    // Retourne le nouveau nom s'il existe, sinon l'ancien
    return this.jobMapping[oldJobTitle] || oldJobTitle;
  }

  /**
   * Vérifie si un métier a besoin d'être migré
   * @param jobTitle Le nom du métier à vérifier
   * @returns true si le métier doit être migré
   */
  static needsMigration(jobTitle: string): boolean {
    return this.jobMapping.hasOwnProperty(jobTitle);
  }

  /**
   * Migre une liste de métiers
   * @param jobTitles Liste des anciens noms de métiers
   * @returns Liste des nouveaux noms inclusifs
   */
  static migrateJobTitles(jobTitles: string[]): string[] {
    return jobTitles.map(job => this.migrateJobTitle(job));
  }

  /**
   * Obtient tous les mappings disponibles
   * @returns Objet contenant tous les mappings ancien -> nouveau
   */
  static getAllMappings(): Record<string, string> {
    return { ...this.jobMapping };
  }

  /**
   * Obtient le nombre de métiers à migrer
   * @returns Nombre total de métiers dans le mapping
   */
  static getMigrationCount(): number {
    return Object.keys(this.jobMapping).length;
  }
}