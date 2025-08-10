// MyCrew React Native - Job Badges Component
// Composant pour afficher les métiers sous forme de badges verts

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MyCrewColors } from '../constants/Colors';

interface JobBadgesProps {
  jobTitles: string[];
  maxDisplay?: number;
  style?: any;
  badgeBackgroundColor?: string;
  badgeTextColor?: string;
  badgeBorderColor?: string;
}

export default function JobBadges({ 
  jobTitles, 
  maxDisplay = 3, 
  style, 
  badgeBackgroundColor = MyCrewColors.accent,
  badgeTextColor = 'white',
  badgeBorderColor
}: JobBadgesProps) {
  if (!jobTitles || jobTitles.length === 0) {
    return null;
  }

  const displayedJobs = jobTitles.slice(0, maxDisplay);
  const remainingCount = jobTitles.length - displayedJobs.length;

  const badgeStyle = {
    backgroundColor: badgeBackgroundColor,
    ...(badgeBorderColor && { 
      borderWidth: 1, 
      borderColor: badgeBorderColor 
    })
  };

  return (
    <View style={[styles.container, style]}>
      {displayedJobs.map((job, index) => (
        <View key={index} style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>
            {job}
          </Text>
        </View>
      ))}
      {remainingCount > 0 && (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>
            +{remainingCount}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: MyCrewColors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 24,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    includeFontPadding: false,
  },
});