import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MyCrewColors } from '../constants/Colors';
import { ImportService, ImportResult } from '../services/ImportService';

const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

const Typography = {
  small: 12,
  body: 14,
  subheadline: 16,
  headline: 18,
  title: 20,
  largeTitle: 24,
};

const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
};

const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
};

export default function ImportOptionsScreen() {
  const navigation = useNavigation();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportFile = async () => {
    if (isImporting) return;
    
    setIsImporting(true);
    
    try {
      const result: ImportResult = await ImportService.importFromFile();
      
      if (result.success) {
        let message = `✅ ${result.imported} contact${result.imported > 1 ? 's' : ''} importé${result.imported > 1 ? 's' : ''}`;
        
        if (result.duplicates > 0) {
          message += `\n⚠️ ${result.duplicates} doublon${result.duplicates > 1 ? 's' : ''} ignoré${result.duplicates > 1 ? 's' : ''}`;
        }
        
        if (result.errors.length > 0) {
          message += `\n❌ ${result.errors.length} erreur${result.errors.length > 1 ? 's' : ''}`;
        }
        
        Alert.alert('Import terminé', message, [{ text: 'OK' }]);
      } else {
        if (result.errors.length > 0 && !result.errors[0].includes('annulé')) {
          Alert.alert(
            'Erreur d\'import',
            result.errors.join('\n'),
            [{ text: 'OK' }]
          );
        }
      }
      
    } catch (error) {
      console.error('Erreur import:', error);
      Alert.alert(
        'Erreur d\'import',
        error.message || 'Une erreur s\'est produite lors de l\'import.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleQRScan = () => {
    // Navigate to QR Scanner
    navigation.navigate('QRScanner' as any);
  };

  const ImportMethodCard = ({ 
    title, 
    description, 
    icon, 
    onPress,
    disabled = false 
  }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.methodCard, disabled && styles.methodCardDisabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.methodIcon}>
        <Ionicons 
          name={icon as any} 
          size={32} 
          color={disabled ? MyCrewColors.textMuted : MyCrewColors.accent} 
        />
      </View>
      
      <View style={styles.methodContent}>
        <Text style={[styles.methodTitle, disabled && styles.textDisabled]}>
          {title}
        </Text>
        <Text style={[styles.methodDescription, disabled && styles.textDisabled]}>
          {description}
        </Text>
      </View>
      
      <View style={styles.methodAction}>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={disabled ? MyCrewColors.textMuted : MyCrewColors.iconMuted} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* En-tête */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Importer des contacts</Text>
        <Text style={styles.headerDescription}>
          Ajoutez des contacts depuis des fichiers ou des codes QR
        </Text>
      </View>
      
      {/* Méthodes d'import */}
      <View style={styles.methodsSection}>
        <Text style={styles.sectionTitle}>Choisir la méthode d'import</Text>
        
        <ImportMethodCard
          title="Importer depuis un fichier"
          description="Sélectionnez un fichier JSON, CSV ou vCard depuis votre appareil"
          icon="document-outline"
          onPress={handleImportFile}
          disabled={isImporting}
        />
        
        <ImportMethodCard
          title="Scanner un code QR"
          description="Importez un contact directement depuis un code QR MyCrew"
          icon="qr-code-outline"
          onPress={handleQRScan}
        />
      </View>
      
      {/* Formats supportés */}
      <View style={styles.formatsCard}>
        <View style={styles.formatHeader}>
          <Ionicons name="file-tray-outline" size={20} color={MyCrewColors.accent} />
          <Text style={styles.formatTitle}>Formats supportés</Text>
        </View>
        
        <View style={styles.formatsList}>
          <View style={styles.formatItem}>
            <Text style={styles.formatName}>JSON</Text>
            <Text style={styles.formatDesc}>Fichiers d'export MyCrew et autres apps</Text>
          </View>
          
          <View style={styles.formatItem}>
            <Text style={styles.formatName}>CSV</Text>
            <Text style={styles.formatDesc}>Fichiers Excel, Google Sheets, etc.</Text>
          </View>
          
          <View style={styles.formatItem}>
            <Text style={styles.formatName}>vCard</Text>
            <Text style={styles.formatDesc}>Contacts exportés depuis iOS, Android, Outlook</Text>
          </View>
          
          <View style={styles.formatItem}>
            <Text style={styles.formatName}>QR Code</Text>
            <Text style={styles.formatDesc}>Codes QR générés par MyCrew</Text>
          </View>
        </View>
      </View>
      
      {/* Instructions et conseils */}
      <View style={styles.instructionsCard}>
        <View style={styles.instructionHeader}>
          <Ionicons name="bulb-outline" size={20} color={MyCrewColors.accent} />
          <Text style={styles.instructionTitle}>Conseils d'import</Text>
        </View>
        
        <Text style={styles.instructionText}>
          • Les doublons (même nom + téléphone) sont automatiquement ignorés{'\n'}
          • Vérifiez vos contacts après l'import{'\n'}
          • Les erreurs de format sont signalées en détail{'\n'}
          • L'import est annulable à tout moment
        </Text>
      </View>
      
      {/* Status d'import */}
      {isImporting && (
        <View style={styles.importingCard}>
          <Text style={styles.importingText}>Import en cours...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  headerCard: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  headerTitle: {
    fontSize: Typography.title,
    fontWeight: '700',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  methodsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: MyCrewColors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  methodContent: {
    flex: 1,
  },
  methodTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  methodDescription: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    lineHeight: 20,
  },
  methodAction: {
    marginLeft: Spacing.sm,
  },
  textDisabled: {
    color: MyCrewColors.textMuted,
  },
  formatsCard: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  formatTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  formatsList: {
    gap: Spacing.sm,
  },
  formatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  formatName: {
    fontSize: Typography.body,
    fontWeight: '500',
    color: MyCrewColors.accent,
    minWidth: 60,
  },
  formatDesc: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    flex: 1,
    marginLeft: Spacing.md,
  },
  instructionsCard: {
    backgroundColor: MyCrewColors.accentLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  instructionTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.accent,
  },
  instructionText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    lineHeight: 22,
  },
  importingCard: {
    backgroundColor: MyCrewColors.accent,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  importingText: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.background,
  },
});