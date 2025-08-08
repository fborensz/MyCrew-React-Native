// MyCrew React Native - Splash Screen
// Initial loading screen with MyCrew branding

import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { MyCrewColors } from '../constants/Colors';

export default function SplashScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText variant="largeTitle" weight="bold" color="accent">
          MyCrew
        </ThemedText>
        <ThemedText variant="subheadline" color="textSecondary" style={styles.subtitle}>
          Gérez vos contacts cinema
        </ThemedText>
        
        <ActivityIndicator 
          size="large" 
          color={MyCrewColors.accent} 
          style={styles.loader}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 32,
  },
  loader: {
    marginTop: 20,
  },
});