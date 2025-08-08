import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MyCrewColors } from '../constants/Colors';
import { Contact } from '../services/DatabaseService';

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

interface ContactRowProps {
  contact: Contact;
  onPress: () => void;
  onQRPress?: (contact: Contact) => void;
  searchQuery?: string;
  showExtraInfo?: {
    locations: boolean;
    attributes: boolean;
  };
}

// Fonction utilitaire pour highlighting
const highlightText = (text: string, query: string) => {
  if (!query || !text) return [{ text, isHighlighted: false }];
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map(part => ({
    text: part,
    isHighlighted: regex.test(part)
  }));
};

const ContactRow: React.FC<ContactRowProps> = ({
  contact,
  onPress,
  onQRPress,
  searchQuery = '',
  showExtraInfo = { locations: true, attributes: true }
}) => {
  
  const primaryLocation = contact.locations.find(loc => loc.isPrimary) || contact.locations[0];
  const secondaryLocations = contact.locations.filter(loc => !loc.isPrimary);
  
  const handleCall = () => {
    if (contact.phone) {
      Linking.openURL(`tel:${contact.phone}`);
    }
  };
  
  const handleEmail = () => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    }
  };
  
  const renderHighlightedText = (text: string, style: any) => {
    const highlights = highlightText(text, searchQuery);
    
    return (
      <Text style={style}>
        {highlights.map((part, index) => (
          <Text
            key={index}
            style={[
              style,
              part.isHighlighted && { backgroundColor: MyCrewColors.accent }
            ]}
          >
            {part.text}
          </Text>
        ))}
      </Text>
    );
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        {/* En-tête avec nom et favori */}
        <View style={styles.headerRow}>
          {renderHighlightedText(contact.name, styles.name)}
          {contact.isFavorite && (
            <Ionicons name="star" size={16} color={MyCrewColors.accent} />
          )}
        </View>
        
        {/* Métier */}
        {renderHighlightedText(contact.jobTitle, styles.job)}
        
        {/* Contact info */}
        <View style={styles.contactInfo}>
          {contact.phone && (
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call-outline" size={14} color={MyCrewColors.accent} />
              {renderHighlightedText(contact.phone, styles.contactText)}
            </TouchableOpacity>
          )}
          
          {contact.email && (
            <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
              <Ionicons name="mail-outline" size={14} color={MyCrewColors.accent} />
              {renderHighlightedText(contact.email, styles.contactText)}
            </TouchableOpacity>
          )}
        </View>
        
        {/* Localisation principale */}
        {showExtraInfo.locations && primaryLocation && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={MyCrewColors.iconMuted} />
            <Text style={styles.locationText}>
              {primaryLocation.country}
              {primaryLocation.region && ` • ${primaryLocation.region}`}
            </Text>
          </View>
        )}
        
        {/* Localisations secondaires */}
        {showExtraInfo.locations && secondaryLocations.length > 0 && (
          <View style={styles.secondaryLocations}>
            {secondaryLocations.slice(0, 2).map((location, index) => (
              <Text key={index} style={styles.secondaryLocationText}>
                {location.country}{location.region && ` (${location.region})`}
              </Text>
            ))}
            {secondaryLocations.length > 2 && (
              <Text style={styles.moreLocationsText}>
                +{secondaryLocations.length - 2} autres
              </Text>
            )}
          </View>
        )}
        
        {/* Attributs */}
        {showExtraInfo.attributes && primaryLocation && (
          <View style={styles.attributesRow}>
            {primaryLocation.isLocalResident && (
              <View style={styles.attributeTag}>
                <Text style={styles.attributeText}>Résident</Text>
              </View>
            )}
            {primaryLocation.hasVehicle && (
              <View style={styles.attributeTag}>
                <Text style={styles.attributeText}>Véhicule</Text>
              </View>
            )}
            {primaryLocation.isHoused && (
              <View style={styles.attributeTag}>
                <Text style={styles.attributeText}>Logé</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Notes */}
        {contact.notes && (
          <View style={styles.notesContainer}>
            {renderHighlightedText(
              contact.notes.length > 100 
                ? `${contact.notes.substring(0, 100)}...`
                : contact.notes,
              styles.notesText
            )}
          </View>
        )}
      </View>
      
      {/* Actions à droite */}
      <View style={styles.rightSection}>
        {onQRPress && (
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => onQRPress(contact)}
          >
            <Ionicons name="qr-code-outline" size={20} color={MyCrewColors.accent} />
          </TouchableOpacity>
        )}
        
        <Ionicons name="chevron-forward" size={16} color={MyCrewColors.iconMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: MyCrewColors.cardBackground,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    ...Shadows.small,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.subheadline,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    flex: 1,
  },
  job: {
    fontSize: Typography.body,
    color: MyCrewColors.accent,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  contactInfo: {
    marginBottom: Spacing.xs,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs / 2,
    gap: Spacing.xs,
  },
  contactText: {
    fontSize: Typography.small,
    color: MyCrewColors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs / 2,
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.small,
    color: MyCrewColors.textSecondary,
  },
  secondaryLocations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs / 2,
  },
  secondaryLocationText: {
    fontSize: Typography.small,
    color: MyCrewColors.textMuted,
  },
  moreLocationsText: {
    fontSize: Typography.small,
    color: MyCrewColors.textMuted,
    fontStyle: 'italic',
  },
  attributesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs / 2,
  },
  attributeTag: {
    backgroundColor: MyCrewColors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.sm,
  },
  attributeText: {
    fontSize: Typography.small - 1,
    color: MyCrewColors.accent,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: Spacing.xs / 2,
  },
  notesText: {
    fontSize: Typography.small,
    color: MyCrewColors.textMuted,
    fontStyle: 'italic',
  },
  qrButton: {
    padding: Spacing.xs,
  },
});

export default ContactRow;