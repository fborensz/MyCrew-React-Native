// MyCrew React Native - QR Code Display Screen
// Basic placeholder for displaying QR codes

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';

export default function QRCodeDisplayScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.centered}>
        <ThemedText variant="title">Code QR</ThemedText>
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