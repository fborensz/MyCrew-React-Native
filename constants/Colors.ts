// MyCrew React Native - Color System
// Based on MyCrewColors.swift - exact color values from Swift app

export const MyCrewColors = {
  // Main color palette from Swift app
  background: '#F1F6F3',        // Light sage green
  accent: '#7BAE7F',            // Primary forest green
  accentSecondary: '#A3C8A8',   // Lighter green for headers
  textPrimary: '#2F3E34',       // Dark green-gray
  textSecondary: '#4A4A4A',     // Medium gray
  iconMuted: '#6F8F7B',         // Muted green for icons
  favoriteStar: '#D9B66F',      // Gold for favorites
  cardBackground: '#FFFFFF',     // Pure white for cards
  navigationText: '#000000',     // Force black for navigation
  border: '#E5E5EA',            // Border color for inputs and cards
  
  // Additional colors for React Native specific needs
  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF3B30',              // iOS red for errors
  blue: '#007AFF',             // iOS blue for links
  gray: '#8E8E93',             // iOS gray for placeholders
  lightGray: '#F2F2F7',        // iOS light gray for backgrounds
  separator: '#E5E5EA',        // iOS separator color
  destructive: '#FF3B30',      // Destructive actions
  
  // Search highlighting
  searchHighlight: '#FFFF0060', // Yellow with 0.3 opacity (60 in hex)
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  // Opacity variants
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  
} as const;

// Dark theme variant (for future use)
export const MyCrewColorsDark = {
  background: '#1A1A1A',
  accent: '#7BAE7F',
  accentSecondary: '#A3C8A8',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  iconMuted: '#8E8E93',
  favoriteStar: '#D9B66F',
  cardBackground: '#2C2C2E',
  navigationText: '#FFFFFF',
  
  transparent: 'transparent',
  black: '#000000',
  white: '#FFFFFF',
  red: '#FF453A',
  blue: '#0A84FF',
  gray: '#8E8E93',
  lightGray: '#1C1C1E',
  
  searchHighlight: '#FFFF0060',
  
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  
  overlay: 'rgba(0, 0, 0, 0.7)',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
} as const;

// Helper function to get colors based on theme
export const getColors = (isDark: boolean = false) => 
  isDark ? MyCrewColorsDark : MyCrewColors;

// Common color combinations
export const ColorCombinations = {
  primary: {
    background: MyCrewColors.accent,
    text: MyCrewColors.white,
  },
  secondary: {
    background: MyCrewColors.accentSecondary,
    text: MyCrewColors.textPrimary,
  },
  favorite: {
    background: MyCrewColors.favoriteStar,
    text: MyCrewColors.white,
  },
  card: {
    background: MyCrewColors.cardBackground,
    text: MyCrewColors.textPrimary,
    border: MyCrewColors.lightGray,
  },
  filter: {
    active: MyCrewColors.accent,
    inactive: MyCrewColors.lightGray,
  },
} as const;

export type ColorKeys = keyof typeof MyCrewColors;
export type ColorValue = typeof MyCrewColors[ColorKeys];

// Spacing system
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Typography system
export const Typography = {
  caption: 12,
  footnote: 13,
  subheadline: 15,
  body: 17,
  headline: 20,
  title: 24,
  largeTitle: 34,
} as const;

// Font weights
export const FontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
} as const;

// Shadow presets
export const Shadows = {
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;
