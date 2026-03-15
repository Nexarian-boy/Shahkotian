import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { COLORS } from './src/config/constants';
import { initAds, onScreenView } from './src/utils/AdManager';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import TournamentsScreen from './src/screens/TournamentsScreen';
import TournamentDetailScreen from './src/screens/TournamentDetailScreen';
import GovtOfficesScreen from './src/screens/GovtOfficesScreen';
import BazarScreen from './src/screens/BazarScreen';
import NewsScreen from './src/screens/NewsScreen';
import RishtaScreen from './src/screens/RishtaScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import WeatherScreen from './src/screens/WeatherScreen';
import BloodDonationScreen from './src/screens/BloodDonationScreen';
import AIChatbotScreen from './src/screens/AIChatbotScreen';
import DMChatScreen from './src/screens/DMChatScreen';
import DMListScreen from './src/screens/DMListScreen';
import OpenChatScreen from './src/screens/OpenChatScreen';
import HelplineScreen from './src/screens/HelplineScreen';
import DoctorsScreen from './src/screens/DoctorsScreen';
import JobsScreen from './src/screens/JobsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import RestaurantDealsScreen from './src/screens/RestaurantDealsScreen';
import ClothBrandDealsScreen from './src/screens/ClothBrandDealsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ISLAMIC_GREETINGS = [
  {
    arabic: 'الحمد للہ',
    transliteration: 'Alhumdulillah',
    meaning: 'All praise is for Allah',
    urdu: 'تمام تعریفیں اللہ کے لیے ہیں',
    emoji: '🤲',
    color: '#0C8A43',
  },
  {
    arabic: 'اللہ اکبر',
    transliteration: 'Allah-Hu-Akbar',
    meaning: 'Allah is the Greatest',
    urdu: 'اللہ سب سے بڑا ہے',
    emoji: '☪️',
    color: '#1a5c8a',
  },
  {
    arabic: 'سبحان اللہ',
    transliteration: 'SubhanAllah',
    meaning: 'Glory be to Allah',
    urdu: 'اللہ پاک ہے',
    emoji: '✨',
    color: '#7c3aed',
  },
];

// Bottom Tab Navigator — 5 Tabs: Home, Marketplace, Explore, Community, Profile
function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 6 + insets.bottom,
          paddingTop: 6,
          height: 62 + insets.bottom,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={24} color={color} />,
          tabBarLabel: 'Buy & Sell',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="compass" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Auth Flow Navigation
function AppNavigator() {
  const { isAuthenticated, loading, isNewUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check onboarding status when authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      AsyncStorage.getItem('hasSeenOnboarding').then((val) => {
        setNeedsOnboarding(val !== 'true');
        setOnboardingChecked(true);
      });
    } else {
      setOnboardingChecked(true);
    }
  }, [isAuthenticated]);

  if (showSplash || loading || !onboardingChecked) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="RestaurantDeals" component={RestaurantDealsScreen} />
          <Stack.Screen name="ClothBrands" component={ClothBrandDealsScreen} />
          <Stack.Screen name="Doctors" component={DoctorsScreen} />
        </>
      ) : (
        <>
          {needsOnboarding && (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )}
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Tournaments" component={TournamentsScreen} />
          <Stack.Screen name="TournamentDetail" component={TournamentDetailScreen} />
          <Stack.Screen name="GovtOffices" component={GovtOfficesScreen} />
          <Stack.Screen name="Bazar" component={BazarScreen} />
          <Stack.Screen name="News & Articles" component={NewsScreen} />
          <Stack.Screen name="Rishta" component={RishtaScreen} />
          <Stack.Screen name="Weather" component={WeatherScreen} />
          <Stack.Screen name="BloodDonation" component={BloodDonationScreen} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="AIChatbot" component={AIChatbotScreen} />
          <Stack.Screen name="DMList" component={DMListScreen} />
          <Stack.Screen name="DMChat" component={DMChatScreen} />
          <Stack.Screen name="OpenChat" component={OpenChatScreen} />
          <Stack.Screen name="Helpline" component={HelplineScreen} />
          <Stack.Screen name="Doctors" component={DoctorsScreen} />
          <Stack.Screen name="Jobs" component={JobsScreen} />
          <Stack.Screen name="RestaurantDeals" component={RestaurantDealsScreen} />
          <Stack.Screen name="ClothBrands" component={ClothBrandDealsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef(null);
  const [greeting, setGreeting] = useState(null);

  useEffect(() => {
    initAds();

    // Show random Islamic greeting on every app open
    const randomGreeting = ISLAMIC_GREETINGS[Math.floor(Math.random() * ISLAMIC_GREETINGS.length)];
    setGreeting(randomGreeting);
    // Auto dismiss after 3 seconds
    const greetingTimer = setTimeout(() => setGreeting(null), 3000);

    // Handle notification tap when app is CLOSED or BACKGROUND
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (!navigationRef.current) return;

      // Route based on notification type
      if (data?.type === 'TRADER_APPROVED') {
        navigationRef.current.navigate('Bazar');
      } else if (data?.type === 'APPOINTMENT') {
        navigationRef.current.navigate('Doctors');
      } else if (data?.type === 'NEWS') {
        navigationRef.current.navigate('News & Articles');
      } else {
        navigationRef.current.navigate('Notifications');
      }
    });

    return () => {
      subscription.remove();
      clearTimeout(greetingTimer);
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <SafeAreaProvider>
          {/* Islamic Greeting Modal — shows on every app open */}
          {greeting && (
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setGreeting(null)}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.85)',
                justifyContent: 'center', alignItems: 'center',
                zIndex: 9999,
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 28,
                  padding: 40,
                  alignItems: 'center',
                  width: '80%',
                  elevation: 20,
                  borderTopWidth: 6,
                  borderTopColor: greeting.color,
                }}
              >
                <Text style={{ fontSize: 56, marginBottom: 8 }}>{greeting.emoji}</Text>
                <Text style={{
                  fontSize: 42, fontWeight: '800',
                  color: greeting.color, textAlign: 'center',
                  marginBottom: 8,
                }}>
                  {greeting.arabic}
                </Text>
                <Text style={{
                  fontSize: 22, fontWeight: '700',
                  color: '#1a1a1a', textAlign: 'center',
                  marginBottom: 4,
                }}>
                  {greeting.transliteration}
                </Text>
                <Text style={{
                  fontSize: 14, color: '#666',
                  textAlign: 'center', marginBottom: 4,
                }}>
                  {greeting.meaning}
                </Text>
                <Text style={{
                  fontSize: 16, color: '#444',
                  textAlign: 'center', marginTop: 4,
                }}>
                  {greeting.urdu}
                </Text>
                <Text style={{
                  fontSize: 12, color: '#aaa',
                  marginTop: 20,
                }}>
                  Tap anywhere to continue
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <NavigationContainer
            ref={navigationRef}
            onStateChange={() => onScreenView()}
          >
            <StatusBar style="light" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
