// MyCrew React Native - QR Code Analysis
// Analyse la capacité et faisabilité des QR codes multi-contacts

import { Contact } from '../types';
import { QRCodeService } from './QRCodeService';

export class QRAnalysis {
  // Limites QR Code par niveau de correction d'erreur
  private static readonly QR_LIMITS = {
    // Version 40 (177x177) - Plus grand QR code standard
    L: 2953, // Low error correction (~7%)
    M: 2331, // Medium error correction (~15%) 
    Q: 1663, // Quartile error correction (~25%)
    H: 1273, // High error correction (~30%)
  };

  // Analyser un contact unique
  static analyzeContactSize(contact: Contact): {
    jsonSize: number;
    compressedEstimate: number;
    isQRFeasible: boolean;
  } {
    const qrData = QRCodeService.generateContactQRData(contact);
    const jsonSize = new Blob([qrData]).size;
    
    // Estimation compression (JSON compresse bien ~60-70%)
    const compressedEstimate = Math.ceil(jsonSize * 0.65);
    
    return {
      jsonSize,
      compressedEstimate,
      isQRFeasible: compressedEstimate <= this.QR_LIMITS.L
    };
  }

  // Analyser multiple contacts
  static analyzeMultipleContacts(contacts: Contact[]): {
    totalJsonSize: number;
    totalCompressedEstimate: number;
    avgContactSize: number;
    maxContactsFeasible: number;
    isCurrentBatchFeasible: boolean;
    recommendations: string[];
  } {
    let totalJsonSize = 0;
    const contactSizes: number[] = [];

    // Structure pour multiple contacts
    const multiContactData = {
      type: 'MyCrew_ContactList',
      version: '1.0',
      count: contacts.length,
      contacts: contacts.map(contact => ({
        firstName: contact.firstName,
        lastName: contact.lastName,
        jobTitle: contact.jobTitle,
        phone: contact.phone,
        email: contact.email,
        // On pourrait omettre les notes et certaines locations pour économiser
        locations: contact.locations.map(loc => ({
          country: loc.country,
          region: loc.region,
          isLocalResident: loc.isLocalResident,
          hasVehicle: loc.hasVehicle,
          isHoused: loc.isHoused,
          isPrimary: loc.isPrimary
        }))
      }))
    };

    const jsonString = JSON.stringify(multiContactData);
    totalJsonSize = new Blob([jsonString]).size;
    
    // Estimation compression
    const totalCompressedEstimate = Math.ceil(totalJsonSize * 0.65);
    
    // Taille moyenne par contact
    const avgContactSize = Math.ceil(totalCompressedEstimate / contacts.length);
    
    // Nombre max de contacts possibles
    const maxContactsFeasible = Math.floor(this.QR_LIMITS.L / avgContactSize);
    
    // Est-ce que le lot actuel est faisable?
    const isCurrentBatchFeasible = totalCompressedEstimate <= this.QR_LIMITS.L;

    // Recommandations
    const recommendations: string[] = [];
    
    if (!isCurrentBatchFeasible) {
      recommendations.push(`⚠️ ${contacts.length} contacts dépassent la limite QR (~${totalCompressedEstimate}B > ${this.QR_LIMITS.L}B)`);
      recommendations.push(`✅ Maximum recommandé: ${maxContactsFeasible} contacts`);
    } else {
      recommendations.push(`✅ ${contacts.length} contacts OK pour QR code (~${totalCompressedEstimate}B)`);
    }

    if (totalCompressedEstimate > this.QR_LIMITS.M) {
      recommendations.push(`📱 Utilisez niveau d'erreur LOW pour maximiser l'espace`);
    }

    if (avgContactSize > 150) {
      recommendations.push(`💡 Contacts volumineux, considérez omettre les notes/locations secondaires`);
    }

    return {
      totalJsonSize,
      totalCompressedEstimate,
      avgContactSize,
      maxContactsFeasible,
      isCurrentBatchFeasible,
      recommendations
    };
  }

  // Version optimisée des contacts (moins de données)
  static generateOptimizedMultiContactQR(contacts: Contact[]): {
    jsonString: string;
    size: number;
    compressedEstimate: number;
    isQRFeasible: boolean;
  } {
    const optimizedData = {
      type: 'MyCrew_ContactList_Lite',
      version: '1.0',
      count: contacts.length,
      contacts: contacts.map(contact => ({
        fn: contact.firstName,      // firstName -> fn
        ln: contact.lastName,       // lastName -> ln  
        jt: contact.jobTitle,       // jobTitle -> jt
        ph: contact.phone,          // phone -> ph
        em: contact.email,          // email -> em
        // Omettre notes et locations secondaires
        loc: contact.locations
          .filter(loc => loc.isPrimary)
          .map(loc => ({
            c: loc.country,           // country -> c
            r: loc.region,            // region -> r
            res: loc.isLocalResident, // isLocalResident -> res
            veh: loc.hasVehicle,      // hasVehicle -> veh
            hou: loc.isHoused         // isHoused -> hou
          }))[0] || null  // Juste la location primaire
      }))
    };

    const jsonString = JSON.stringify(optimizedData);
    const size = new Blob([jsonString]).size;
    const compressedEstimate = Math.ceil(size * 0.65);

    return {
      jsonString,
      size,
      compressedEstimate,
      isQRFeasible: compressedEstimate <= this.QR_LIMITS.L
    };
  }

  // Fonction pour tester avec des contacts réels
  static testWithSampleContacts(contacts: Contact[], maxContacts: number = 20): void {
    console.log(`\n🧪 ANALYSE QR CODE - ${Math.min(contacts.length, maxContacts)} contacts`);
    console.log('=====================================');
    
    // Test avec contacts normaux
    const testContacts = contacts.slice(0, maxContacts);
    const analysis = this.analyzeMultipleContacts(testContacts);
    
    console.log('📊 DONNÉES NORMALES:');
    console.log(`   JSON brut: ${analysis.totalJsonSize}B`);
    console.log(`   Compressé: ${analysis.totalCompressedEstimate}B`);
    console.log(`   Moyenne/contact: ${analysis.avgContactSize}B`);
    console.log(`   Max possible: ${analysis.maxContactsFeasible} contacts`);
    console.log(`   Statut: ${analysis.isCurrentBatchFeasible ? '✅ OK' : '❌ Trop gros'}`);
    
    // Test avec version optimisée
    const optimized = this.generateOptimizedMultiContactQR(testContacts);
    const reduction = Math.round((1 - optimized.size / analysis.totalJsonSize) * 100);
    
    console.log('\n⚡ DONNÉES OPTIMISÉES:');
    console.log(`   JSON brut: ${optimized.size}B (-${reduction}%)`);
    console.log(`   Compressé: ${optimized.compressedEstimate}B`);
    console.log(`   Statut: ${optimized.isQRFeasible ? '✅ OK' : '❌ Trop gros'}`);
    
    console.log('\n💡 RECOMMANDATIONS:');
    analysis.recommendations.forEach(rec => console.log(`   ${rec}`));
    
    console.log(`\n🎯 LIMITES QR CODE:`);
    console.log(`   Low (7% erreur): ${this.QR_LIMITS.L}B`);
    console.log(`   Medium (15% erreur): ${this.QR_LIMITS.M}B`);
    console.log(`   High (30% erreur): ${this.QR_LIMITS.H}B`);
  }
}