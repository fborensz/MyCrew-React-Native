// MyCrew React Native - Themed View Component
// Uses MyCrew color system for consistent UI backgrounds

import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { MyCrewColors, Shadows, BorderRadius } from '../constants/Colors';

export interface ThemedViewProps extends ViewProps {
  backgroundColor?: keyof typeof MyCrewColors;
  shadow?: keyof typeof Shadows;
  borderRadius?: keyof typeof BorderRadius;
  children?: React.ReactNode;
}

export function ThemedView({
  backgroundColor = 'background',
  shadow,
  borderRadius,
  style,
  children,
  ...props
}: ThemedViewProps) {
  const bgColor = MyCrewColors[backgroundColor];
  const shadowStyle = shadow ? Shadows[shadow] : undefined;
  const borderRadiusValue = borderRadius ? BorderRadius[borderRadius] : undefined;

  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: borderRadiusValue,
        },
        shadowStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// Pre-defined view styles for common use cases
export const ViewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  card: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  section: {
    backgroundColor: MyCrewColors.cardBackground,
    borderRadius: BorderRadius.md,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  header: {
    backgroundColor: MyCrewColors.accentSecondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  separator: {
    height: 1,
    backgroundColor: MyCrewColors.separator,
    marginHorizontal: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MyCrewColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
});