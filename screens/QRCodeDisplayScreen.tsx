// MyCrew React Native - QR Code Display Screen  
// Placeholder pour futur affichage QR

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MyCrewColors } from '../constants/Colors';

const Typography = {
  body: 14,
  title: 20,
};

export default function QRCodeDisplayScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.centered}>
        <Ionicons 
          name="qr-code-outline" 
          size={80} 
          color={MyCrewColors.iconMuted} 
          style={styles.icon}
        />
        <Text style={styles.title}>Code QR</Text>
        <Text style={styles.subtitle}>
          Fonctionnalité à venir prochainement
        </Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MyCrewColors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: Typography.title,
    fontWeight: '600',
    color: MyCrewColors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Typography.body,
    color: MyCrewColors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: MyCrewColors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: MyCrewColors.background,
    fontSize: Typography.body,
    fontWeight: '600',
  },
});