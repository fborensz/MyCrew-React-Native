// MyCrew React Native - User Profile Editor Screen
// Basic placeholder for editing user profile

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

export default function UserProfileEditorScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.centered}>
        <ThemedText variant="title">Éditer profil</ThemedText>
        <ThemedText variant="body" color="textSecondary" style={styles.subtitle}>
          Écran en cours de développement
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 16,
  },
});