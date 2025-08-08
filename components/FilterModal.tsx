import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MyCrewColors } from '../constants/Colors';
import { FILM_DEPARTMENTS } from '../data/JobTitles';
import { COUNTRIES_WITH_REGIONS } from '../data/Locations';

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

export interface FilterSettings {
  selectedJob: string; // "Tous" for all
  selectedCountry: string; // "Tous" for all
  selectedRegions: Set<string>;
  includeVehicle: boolean;
  includeHoused: boolean;
  includeResident: boolean;
}

interface FilterModalProps {
  visible: boolean;
  filters: FilterSettings;
  onFiltersChange: (filters: FilterSettings) => void;
  onClose: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  visible, 
  filters, 
  onFiltersChange, 
  onClose 
}) => {
  const [localFilters, setLocalFilters] = useState<FilterSettings>(filters);
  
  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };
  
  const handleReset = () => {
    const resetFilters: FilterSettings = {
      selectedJob: 'Tous',
      selectedCountry: 'Tous',
      selectedRegions: new Set(),
      includeVehicle: false,
      includeHoused: false,
      includeResident: false,
    };
    setLocalFilters(resetFilters);
  };
  
  const toggleRegion = (region: string) => {
    const newRegions = new Set(localFilters.selectedRegions);
    if (newRegions.has(region)) {
      newRegions.delete(region);
    } else {
      newRegions.add(region);
    }
    setLocalFilters(prev => ({ ...prev, selectedRegions: newRegions }));
  };
  
  const selectedCountryData = COUNTRIES_WITH_REGIONS.find(
    c => c.name === localFilters.selectedCountry
  );
  
  const allJobs = ['Tous', ...FILM_DEPARTMENTS.flatMap(dept => dept.jobs)];
  const allCountries = ['Tous', ...COUNTRIES_WITH_REGIONS.map(c => c.name)];
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Annuler</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Filtres</Text>
          
          <TouchableOpacity onPress={handleApply}>
            <Text style={styles.applyButton}>Appliquer</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {/* Métier */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métier</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {allJobs.map(job => (
                <TouchableOpacity
                  key={job}
                  style={[
                    styles.filterTag,
                    localFilters.selectedJob === job && styles.filterTagSelected
                  ]}
                  onPress={() => setLocalFilters(prev => ({ ...prev, selectedJob: job }))}
                >
                  <Text style={[
                    styles.filterTagText,
                    localFilters.selectedJob === job && styles.filterTagTextSelected
                  ]}>
                    {job}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Pays */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pays</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {allCountries.map(country => (
                <TouchableOpacity
                  key={country}
                  style={[
                    styles.filterTag,
                    localFilters.selectedCountry === country && styles.filterTagSelected
                  ]}
                  onPress={() => setLocalFilters(prev => ({ 
                    ...prev, 
                    selectedCountry: country,
                    selectedRegions: new Set() // Reset regions when country changes
                  }))}
                >
                  <Text style={[
                    styles.filterTagText,
                    localFilters.selectedCountry === country && styles.filterTagTextSelected
                  ]}>
                    {country}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          {/* Régions */}
          {selectedCountryData && selectedCountryData.regions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Régions - {selectedCountryData.name}
              </Text>
              <View style={styles.regionsContainer}>
                {selectedCountryData.regions.map(region => (
                  <TouchableOpacity
                    key={region}
                    style={[
                      styles.regionTag,
                      localFilters.selectedRegions.has(region) && styles.regionTagSelected
                    ]}
                    onPress={() => toggleRegion(region)}
                  >
                    <Text style={[
                      styles.regionTagText,
                      localFilters.selectedRegions.has(region) && styles.regionTagTextSelected
                    ]}>
                      {region}
                    </Text>
                    {localFilters.selectedRegions.has(region) && (
                      <Ionicons name="checkmark" size={14} color={MyCrewColors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {/* Attributs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attributs</Text>
            
            <TouchableOpacity
              style={styles.attributeRow}
              onPress={() => setLocalFilters(prev => ({ ...prev, includeVehicle: !prev.includeVehicle }))}
            >
              <View style={[
                styles.checkbox,
                localFilters.includeVehicle && styles.checkboxSelected
              ]}>
                {localFilters.includeVehicle && (
                  <Ionicons name="checkmark" size={14} color={MyCrewColors.background} />
                )}
              </View>
              <Text style={styles.attributeText}>Possède un véhicule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attributeRow}
              onPress={() => setLocalFilters(prev => ({ ...prev, includeHoused: !prev.includeHoused }))}
            >
              <View style={[
                styles.checkbox,
                localFilters.includeHoused && styles.checkboxSelected
              ]}>
                {localFilters.includeHoused && (
                  <Ionicons name="checkmark" size={14} color={MyCrewColors.background} />
                )}
              </View>
              <Text style={styles.attributeText}>Logé sur place</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.attributeRow}
              onPress={() => setLocalFilters(prev => ({ ...prev, includeResident: !prev.includeResident }))}
            >
              <View style={[
                styles.checkbox,
                localFilters.includeResident && styles.checkboxSelected
              ]}>
                {localFilters.includeResident && (
                  <Ionicons name="checkmark" size={14} color={MyCrewColors.background} />
                )}
              </View>
              <Text style={styles.attributeText}>Résident fiscal</Text>
            </TouchableOpacity>
          </View>
          
          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Réinitialiser tous les filtres</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: MyCrewColors.border,
  },
  title: {
    fontSize: Typography.headline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
  },
  cancelButton: {
    fontSize: Typography.subheadline,
    color: MyCrewColors.textSecondary,
  },
  applyButton: {
    fontSize: Typography.subheadline,
    color: MyCrewColors.accent,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: Spacing.sm,
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  filterTag: {
    backgroundColor: MyCrewColors.cardBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  filterTagSelected: {
    backgroundColor: MyCrewColors.accent,
    borderColor: MyCrewColors.accent,
  },
  filterTagText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
  filterTagTextSelected: {
    color: MyCrewColors.background,
    fontWeight: '500',
  },
  regionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  regionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MyCrewColors.cardBackground,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: MyCrewColors.border,
    gap: Spacing.xs,
  },
  regionTagSelected: {
    backgroundColor: MyCrewColors.accentLight,
    borderColor: MyCrewColors.accent,
  },
  regionTagText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
  regionTagTextSelected: {
    color: MyCrewColors.accent,
    fontWeight: '500',
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: MyCrewColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: MyCrewColors.accent,
    borderColor: MyCrewColors.accent,
  },
  attributeText: {
    fontSize: Typography.body,
    color: MyCrewColors.textPrimary,
  },
  resetButton: {
    backgroundColor: MyCrewColors.cardBackground,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MyCrewColors.border,
  },
  resetButtonText: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    fontWeight: '500',
  },
});

export default FilterModal;