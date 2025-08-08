// MyCrew React Native - Edit Contact Screen
// Basic placeholder for editing contacts

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

export default function EditContactScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.centered}>
        <ThemedText variant="title">Modifier le contact</ThemedText>
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