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
import { ExportService, ExportFormat } from '../services/ExportService';
import { DatabaseService } from '../services/DatabaseService';

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

export default function ExportOptionsScreen() {
  const navigation = useNavigation();
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState<{
    totalContacts: number;
    favoriteContacts: number;
    contactsWithLocations: number;
    uniqueCountries: number;
    uniqueJobs: number;
  } | null>(null);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const db = DatabaseService.getInstance();
      const contacts = await db.getAllContacts();
      const exportStats = ExportService.getExportStats(contacts);
      setStats(exportStats);
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;
    
    setIsExporting(true);
    
    try {
      const db = DatabaseService.getInstance();
      const contacts = await db.getAllContacts();
      
      if (contacts.length === 0) {
        Alert.alert(
          'Aucun contact',
          'Vous n\'avez aucun contact à exporter.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      await ExportService.exportAndShare(contacts, format);
      
      Alert.alert(
        'Export réussi',
        `${contacts.length} contact${contacts.length > 1 ? 's' : ''} exporté${contacts.length > 1 ? 's' : ''} au format ${format}.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Erreur export:', error);
      Alert.alert(
        'Erreur d\'export',
        error.message || 'Une erreur s\'est produite lors de l\'export.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const ExportFormatCard = ({ 
    format, 
    title, 
    description, 
    icon, 
    disabled = false 
  }: {
    format: ExportFormat;
    title: string;
    description: string;
    icon: string;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.formatCard, disabled && styles.formatCardDisabled]}
      onPress={() => handleExport(format)}
      disabled={disabled || isExporting}
    >
      <View style={styles.formatIcon}>
        <Ionicons 
          name={icon as any} 
          size={32} 
          color={disabled ? MyCrewColors.textMuted : MyCrewColors.accent} 
        />
      </View>
      
      <View style={styles.formatContent}>
        <Text style={[styles.formatTitle, disabled && styles.textDisabled]}>
          {title}
        </Text>
        <Text style={[styles.formatDescription, disabled && styles.textDisabled]}>
          {description}
        </Text>
      </View>
      
      <View style={styles.formatAction}>
        {isExporting ? (
          <Text style={styles.exportingText}>Export...</Text>
        ) : (
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={disabled ? MyCrewColors.textMuted : MyCrewColors.iconMuted} 
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Statistiques */}
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Aperçu de l'export</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalContacts}</Text>
              <Text style={styles.statLabel}>Contact{stats.totalContacts > 1 ? 's' : ''}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.favoriteContacts}</Text>
              <Text style={styles.statLabel}>Favori{stats.favoriteContacts > 1 ? 's' : ''}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.uniqueCountries}</Text>
              <Text style={styles.statLabel}>Pays</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.uniqueJobs}</Text>
              <Text style={styles.statLabel}>Métiers</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Formats d'export */}
      <View style={styles.formatsSection}>
        <Text style={styles.sectionTitle}>Choisir le format d'export</Text>
        
        <ExportFormatCard
          format="JSON"
          title="JSON"
          description="Format structuré avec toutes les données, idéal pour la sauvegarde complète"
          icon="code-outline"
        />
        
        <ExportFormatCard
          format="CSV"
          title="CSV"
          description="Fichier tableur compatible Excel, Google Sheets, etc."
          icon="grid-outline"
        />
        
        <ExportFormatCard
          format="vCard"
          title="vCard"
          description="Format standard pour l'import dans les contacts système"
          icon="person-add-outline"
        />
      </View>
      
      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <View style={styles.instructionHeader}>
          <Ionicons name="information-circle-outline" size={20} color={MyCrewColors.accent} />
          <Text style={styles.instructionTitle}>Comment ça marche ?</Text>
        </View>
        
        <Text style={styles.instructionText}>
          1. Choisissez un format d'export{'\n'}
          2. Le fichier sera créé et partagé{'\n'}
          3. Vous pouvez l'envoyer par email, l'enregistrer dans le cloud, etc.
        </Text>
        
        <Text style={styles.noteText}>
          💡 Conseil : utilisez JSON pour une sauvegarde complète, CSV pour analyser dans Excel, ou vCard pour importer dans d'autres apps.
        </Text>
      </View>
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
  statsCard: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.small,
  },
  statsTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.largeTitle,
    fontWeight: '700',
    color: MyCrewColors.accent,
  },
  statLabel: {
    fontSize: Typography.small,
    color: MyCrewColors.textSecondary,
    marginTop: Spacing.xs / 2,
  },
  formatsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.md,
  },
  formatCard: {
    flexDirection: 'row',
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.small,
  },
  formatCardDisabled: {
    opacity: 0.5,
  },
  formatIcon: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: MyCrewColors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  formatContent: {
    flex: 1,
  },
  formatTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.xs / 2,
  },
  formatDescription: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    lineHeight: 20,
  },
  formatAction: {
    marginLeft: Spacing.sm,
  },
  textDisabled: {
    color: MyCrewColors.textMuted,
  },
  exportingText: {
    fontSize: Typography.body,
    color: MyCrewColors.accent,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: MyCrewColors.accentLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.md,
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
    marginBottom: Spacing.sm,
  },
  noteText: {
    fontSize: Typography.small,
    color: MyCrewColors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});