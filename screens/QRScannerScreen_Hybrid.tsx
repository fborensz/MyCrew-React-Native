// MyCrew QR Scanner Screen - Version Hybride avec fallback automatique
// Cette version détecte les problèmes avec expo-camera et bascule automatiquement vers le fallback

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';

// Import conditionnel des composants
import QRScannerScreenFallback from './QRScannerScreen_Fallback';

let QRScannerScreenCamera: React.ComponentType<any> | null = null;

try {
  // Tentative d'import d'expo-camera
  const { CameraView, useCameraPermissions } = require('expo-camera');
  
  // Si expo-camera est disponible, on utilise l'implémentation normale
  QRScannerScreenCamera = require('./QRScannerScreen').default;
} catch (error) {
  console.log('expo-camera non disponible, utilisation du fallback');
}

interface QRScannerScreenHybridProps {
  // Props éventuelles
}

export default function QRScannerScreenHybrid(props: QRScannerScreenHybridProps) {
  const [useCamera, setUseCamera] = useState(!!QRScannerScreenCamera);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    // Test rapide de disponibilité de la caméra
    if (QRScannerScreenCamera && Platform.OS !== 'web') {
      testCameraAvailability();
    }
  }, []);

  const testCameraAvailability = async () => {
    try {
      // Test basic de permissions pour voir si expo-camera fonctionne
      const { useCameraPermissions } = require('expo-camera');
      
      // Si on arrive ici, expo-camera est chargé correctement
      setUseCamera(true);
      setCameraError(null);
    } catch (error) {
      console.warn('Problème avec expo-camera, basculement vers le fallback:', error);
      setUseCamera(false);
      setCameraError(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  // Si on est sur le web, on utilise toujours le fallback
  if (Platform.OS === 'web') {
    return <QRScannerScreenFallback {...props} />;
  }

  // Si expo-camera n'est pas disponible ou qu'il y a une erreur, utilise le fallback
  if (!useCamera || !QRScannerScreenCamera || cameraError) {
    return <QRScannerScreenFallback {...props} />;
  }

  // Sinon, utilise l'implémentation avec caméra
  return <QRScannerScreenCamera {...props} />;
}

// Composant d'erreur simple au cas où
function CameraErrorScreen({ error }: { error: string }) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        Problème avec la caméra : {error}
      </Text>
      <Text style={styles.errorSubText}>
        Utilisation du mode de saisie manuelle...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});