// MyCrew React Native - Main App Entry Point
// Standard React Navigation setup for MyCrew app

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { DatabaseService } from './services/DatabaseService';
import { SampleDataService } from './services/SampleDataService';
import { MyCrewColors } from './constants/Colors';
import { RootStackParamList, TabParamList } from './types';

// Screens
import ContactsScreen from './screens/ContactsScreen';
import ContactDetailScreen from './screens/ContactDetailScreen';
import AddContactScreen from './screens/AddContactScreen';
import EditContactScreen from './screens/EditContactScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import QRCodeDisplayScreen from './screens/QRCodeDisplayScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserProfileEditorScreen from './screens/UserProfileEditorScreen';
import SettingsScreen from './screens/SettingsScreen';
import ExportOptionsScreen from './screens/ExportOptionsScreen';
import ImportOptionsScreen from './screens/ImportOptionsScreen';
import SplashScreen from './screens/SplashScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: MyCrewColors.accent,
        tabBarInactiveTintColor: MyCrewColors.iconMuted,
        tabBarStyle: {
          backgroundColor: MyCrewColors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: MyCrewColors.accentSecondary,
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
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
      })}
    >
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          title: 'MyCrew',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 24,
            color: MyCrewColors.textPrimary,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Mon profil',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Paramètres',
        }}
      />
    </Tab.Navigator>
  );
}

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
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ContactDetail" 
          component={ContactDetailScreen}
          options={{ title: 'Contact' }}
        />
        <Stack.Screen 
          name="AddContact" 
          component={AddContactScreen}
          options={{ title: 'Nouveau contact' }}
        />
        <Stack.Screen 
          name="EditContact" 
          component={EditContactScreen}
          options={{ title: 'Modifier contact' }}
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
          name="UserProfileEditor" 
          component={UserProfileEditorScreen}
          options={{ title: 'Éditer profil' }}
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
      </Stack.Navigator>
      <StatusBar style="dark" backgroundColor={MyCrewColors.background} />
    </NavigationContainer>
  );
}