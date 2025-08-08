// MyCrew React Native - Themed Text Component
// Uses MyCrew color system for consistent typography

import React from 'react';
import { Text, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { MyCrewColors, Typography, FontWeight } from '../constants/Colors';

export type TextVariant = 
  | 'largeTitle'
  | 'title'
  | 'headline'
  | 'body'
  | 'subheadline'
  | 'footnote'
  | 'caption';

export interface ThemedTextProps extends RNTextProps {
  variant?: TextVariant;
  color?: keyof typeof MyCrewColors;
  weight?: keyof typeof FontWeight;
  children: React.ReactNode;
}

export function ThemedText({
  variant = 'body',
  color = 'textPrimary',
  weight = 'regular',
  style,
  children,
  ...props
}: ThemedTextProps) {
  const textColor = MyCrewColors[color];
  const fontSize = Typography[variant];
  const fontWeight = FontWeight[weight];

  return (
    <Text
      style={[
        {
          fontSize,
          fontWeight,
          color: textColor,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Pre-defined text styles for common use cases
export const TextStyles = StyleSheet.create({
  title: {
    fontSize: Typography.title,
    fontWeight: FontWeight.bold,
    color: MyCrewColors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.headline,
    fontWeight: FontWeight.semibold,
    color: MyCrewColors.textSecondary,
  },
  body: {
    fontSize: Typography.body,
    fontWeight: FontWeight.regular,
    color: MyCrewColors.textPrimary,
  },
  caption: {
    fontSize: Typography.caption,
    fontWeight: FontWeight.regular,
    color: MyCrewColors.textSecondary,
  },
  link: {
    fontSize: Typography.body,
    fontWeight: FontWeight.medium,
    color: MyCrewColors.blue,
  },
  error: {
    fontSize: Typography.footnote,
    fontWeight: FontWeight.medium,
    color: MyCrewColors.error,
  },
});