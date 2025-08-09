// QRScannerScreen avec react-native-qrcode-scanner
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MyCrewColors } from '../constants/Colors';
import { QRCodeService } from '../services/QRCodeService';

const { width, height } = Dimensions.get('window');

export default function QRScannerScreen() {
  const navigation = useNavigation();
  const [flashOn, setFlashOn] = useState(false);
  const [scanner, setScanner] = useState<QRCodeScanner | null>(null);

  const handleQRCodeRead = (event: { data: string; type: string }) => {
    try {
      const contactData = QRCodeService.parseQRData(event.data);
      
      if (contactData) {
        Alert.alert(
          'Contact trouvé !',
          `${contactData.firstName} ${contactData.lastName}${contactData.job ? `\n${contactData.job}` : ''}`,
          [
            {
              text: 'Ignorer',
              style: 'cancel',
              onPress: () => {
                // Réactiver le scanner
                scanner?.reactivate();
              },
            },
            {
              text: 'Ajouter',
              onPress: () => {
                navigation.navigate('AddContact', { contactData });
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'QR Code invalide',
          'Ce QR code ne contient pas de données de contact valides.',
          [
            {
              text: 'OK',
              onPress: () => {
                scanner?.reactivate();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors du parsing du QR code:', error);
      Alert.alert(
        'Erreur',
        'Impossible de lire ce QR code.',
        [
          {
            text: 'OK',
            onPress: () => {
              scanner?.reactivate();
            },
          },
        ]
      );
    }
  };

  const renderTopContent = () => (
    <View style={styles.topContent}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner QR Code</Text>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setFlashOn(!flashOn)}
        >
          <Ionicons 
            name={flashOn ? "flash" : "flash-off"} 
            size={24} 
            color={flashOn ? MyCrewColors.accent : "white"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBottomContent = () => (
    <View style={styles.bottomContent}>
      <Text style={styles.instruction}>
        Placez le QR code dans la zone de scan
      </Text>
      <Text style={styles.subInstruction}>
        Le scan se fera automatiquement
      </Text>
      
      <TouchableOpacity
        style={styles.manualButton}
        onPress={() => {
          // Option pour saisie manuelle ou autres actions
          Alert.alert(
            'Autres options',
            'Que souhaitez-vous faire ?',
            [
              { text: 'Annuler', style: 'cancel' },
              {
                text: 'Saisie manuelle',
                onPress: () => navigation.navigate('AddContact'),
              },
            ]
          );
        }}
      >
        <Ionicons name="create-outline" size={20} color="white" />
        <Text style={styles.manualButtonText}>Saisie manuelle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      
      <QRCodeScanner
        ref={(node) => setScanner(node)}
        onRead={handleQRCodeRead}
        flashMode={flashOn ? 'torch' : 'off'}
        topContent={renderTopContent()}
        bottomContent={renderBottomContent()}
        cameraStyle={styles.cameraStyle}
        containerStyle={styles.scannerContainer}
        showMarker={true}
        markerStyle={styles.marker}
        customMarker={
          <View style={styles.customMarker}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        }
        cameraContainerStyle={styles.cameraContainer}
        topViewStyle={styles.topView}
        bottomViewStyle={styles.bottomView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scannerContainer: {
    flex: 1,
  },
  cameraStyle: {
    height: height,
  },
  cameraContainer: {
    flex: 1,
  },
  topView: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  bottomView: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  topContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    borderColor: MyCrewColors.accent,
    borderWidth: 2,
  },
  customMarker: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: MyCrewColors.accent,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  bottomContent: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
    minHeight: 150,
  },
  instruction: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInstruction: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
});