// MyCrew React Native - Splash Screen
// Initial loading screen with MyCrew branding

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { MyCrewColors } from '../constants/Colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>
          MyCrew
        </Text>
        <Text style={styles.subtitle}>
          Gérez vos contacts cinéma
        </Text>
        
        <ActivityIndicator 
          size="large" 
          color={MyCrewColors.accent} 
          style={styles.loader}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MyCrewColors.background,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MyCrewColors.accent,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: MyCrewColors.textSecondary,
    marginBottom: 32,
  },
  loader: {
    marginTop: 20,
  },
});