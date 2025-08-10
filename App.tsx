// MyCrew React Native - Main App Entry Point
// Standard React Navigation setup for MyCrew app

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, View } from 'react-native';

import { DatabaseService } from './services/DatabaseService';
import { SampleDataService } from './services/SampleDataService';
import { MyCrewColors } from './constants/Colors';
import { RootStackParamList } from './types';

// Screens
import ContactsScreen from './screens/ContactsScreen';
import ContactDetailScreen from './screens/ContactDetailScreen';
import AddContactScreen from './screens/AddContactScreen';
import EditContactScreen from './screens/EditContactScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import QRCodeDisplayScreen from './screens/QRCodeDisplayScreen';
import MultiQRExportScreen from './screens/MultiQRExportScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserProfileEditorScreen from './screens/UserProfileEditorScreen';
import SettingsScreen from './screens/SettingsScreen';
import ExportOptionsScreen from './screens/ExportOptionsScreen';
import ImportOptionsScreen from './screens/ImportOptionsScreen';
import SplashScreen from './screens/SplashScreen';

const Stack = createStackNavigator<RootStackParamList>();

// Composant pour le logo dans le header
const HeaderLogo = () => (
  <View style={{ alignItems: 'center', marginLeft: 16 }}>
    <Image 
      source={require('./assets/images/logo.png')} 
      style={{ 
        width: 48, 
        height: 48, 
        resizeMode: 'contain' 
      }} 
    />
  </View>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initialize database
        const db = DatabaseService.getInstance();
        await db.initialize();
        
        // Seed with sample data if needed
        await SampleDataService.seedDatabase();
        
        // Simulate loading time for splash screen
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoading(false);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsLoading(false);
      }
    }

    initializeApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: MyCrewColors.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: MyCrewColors.accentSecondary,
          },
          headerTintColor: MyCrewColors.textPrimary,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
            color: MyCrewColors.textPrimary,
          },
        }}
      >
        <Stack.Screen 
          name="Contacts" 
          component={ContactsScreen} 
          options={{ 
            headerShown: false,
            title: 'MyCrew'
          }} 
        />
        <Stack.Screen 
          name="ContactDetail" 
          component={ContactDetailScreen}
          options={{ title: 'Contact' }}
        />
        <Stack.Screen 
          name="AddContact" 
          component={AddContactScreen}
          options={{ 
            title: 'Nouveau contact',
            headerLeft: () => <HeaderLogo />
          }}
        />
        <Stack.Screen 
          name="EditContact" 
          component={EditContactScreen}
          options={{ 
            title: 'Modifier contact',
            headerLeft: () => <HeaderLogo />
          }}
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen}
          options={{ title: 'Scanner QR Code' }}
        />
        <Stack.Screen 
          name="QRCodeDisplay" 
          component={QRCodeDisplayScreen}
          options={{ title: 'Code QR' }}
        />
        <Stack.Screen 
          name="MultiQRExport" 
          component={MultiQRExportScreen}
          options={{ title: 'Export QR Multi-Contacts' }}
        />
        <Stack.Screen 
          name="UserProfileEditor" 
          component={UserProfileEditorScreen}
          options={{ 
            title: 'Éditer profil',
            headerLeft: () => <HeaderLogo />
          }}
        />
        <Stack.Screen 
          name="ExportOptions" 
          component={ExportOptionsScreen}
          options={{ title: 'Exporter' }}
        />
        <Stack.Screen 
          name="ImportOptions" 
          component={ImportOptionsScreen}
          options={{ title: 'Importer' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Mon profil' }}
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ title: 'Paramètres' }}
        />
      </Stack.Navigator>
      <StatusBar style="dark" backgroundColor={MyCrewColors.background} />
    </NavigationContainer>
  );
}