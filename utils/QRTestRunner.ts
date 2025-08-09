// MyCrew React Native - QR Test Runner
// Teste la capacité QR avec données réelles

import { Contact } from '../types';
import { QRAnalysis } from '../services/QRAnalysis';
import { DatabaseService } from '../services/DatabaseService';

export class QRTestRunner {
  
  static async runQRCapacityTest(): Promise<void> {
    console.log('🚀 DÉBUT TEST CAPACITÉ QR CODE');
    console.log('==================================');

    try {
      // Récupérer les contacts depuis la DB
      const db = DatabaseService.getInstance();
      const allContacts = await db.getAllContacts();
      
      if (allContacts.length === 0) {
        console.log('❌ Aucun contact en base pour tester');
        return;
      }

      console.log(`📝 ${allContacts.length} contacts trouvés en base`);
      
      // Test 1: Contact unique
      console.log('\n1️⃣ ANALYSE CONTACT UNIQUE:');
      const singleAnalysis = QRAnalysis.analyzeContactSize(allContacts[0]);
      console.log(`   Taille JSON: ${singleAnalysis.jsonSize}B`);
      console.log(`   Compressé: ${singleAnalysis.compressedEstimate}B`);
      console.log(`   Faisable: ${singleAnalysis.isQRFeasible ? '✅' : '❌'}`);

      // Test différentes quantités
      const testSizes = [1, 5, 10, 15, 20];
      
      for (const size of testSizes) {
        if (size <= allContacts.length) {
          console.log(`\n${size}️⃣ TEST ${size} CONTACTS:`);
          
          const testContacts = allContacts.slice(0, size);
          const analysis = QRAnalysis.analyzeMultipleContacts(testContacts);
          
          console.log(`   📏 Taille totale: ${analysis.totalCompressedEstimate}B`);
          console.log(`   📊 Moyenne/contact: ${analysis.avgContactSize}B`);
          console.log(`   📱 Statut: ${analysis.isCurrentBatchFeasible ? '✅ OK' : '❌ TROP GROS'}`);
          console.log(`   🎯 Max théorique: ${analysis.maxContactsFeasible} contacts`);
          
          if (analysis.recommendations.length > 0) {
            console.log('   💡 Recommandations:');
            analysis.recommendations.forEach(rec => console.log(`      ${rec}`));
          }

          // Test version optimisée pour les gros lots
          if (size >= 10) {
            const optimized = QRAnalysis.generateOptimizedMultiContactQR(testContacts);
            const reduction = Math.round((1 - optimized.size / (analysis.totalJsonSize || 1)) * 100);
            console.log(`   ⚡ Version optimisée: ${optimized.compressedEstimate}B (-${reduction}%) ${optimized.isQRFeasible ? '✅' : '❌'}`);
          }
        }
      }

      // Résumé final
      console.log('\n📋 RÉSUMÉ FINAL:');
      console.log('================');
      
      const summary = QRAnalysis.analyzeMultipleContacts(allContacts.slice(0, 20));
      console.log(`🎯 Pour 20 contacts: ${summary.isCurrentBatchFeasible ? 'POSSIBLE' : 'IMPOSSIBLE'}`);
      console.log(`⚡ Max recommandé: ${summary.maxContactsFeasible} contacts`);
      console.log(`📊 Limite QR: ~2950B (Low error correction)`);
      
    } catch (error) {
      console.error('❌ Erreur test QR:', error);
    }
  }

  // Test avec données simulées si pas de DB
  static runSimulatedTest(): void {
    console.log('🧪 TEST SIMULÉ (sans DB)');
    
    // Contact type moyen
    const sampleContact: Contact = {
      id: '1',
      firstName: 'Marie',
      lastName: 'Dubois',
      jobTitle: 'Réalisatrice',
      phone: '+33 6 12 34 56 78',
      email: 'marie.dubois@cinema.fr',
      notes: 'Spécialisée dans les films dramatiques. Très professionnelle et créative.',
      isFavorite: true,
      locations: [{
        id: '1',
        country: 'France',
        region: 'Île-de-France',
        isLocalResident: true,
        hasVehicle: true,
        isHoused: false,
        isPrimary: true
      }]
    };

    // Dupliquer pour simuler 20 contacts
    const contacts: Contact[] = Array.from({ length: 20 }, (_, i) => ({
      ...sampleContact,
      id: `${i + 1}`,
      firstName: `Contact${i + 1}`,
      email: `contact${i + 1}@test.fr`
    }));

    QRAnalysis.testWithSampleContacts(contacts, 20);
  }
}