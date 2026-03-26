import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
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
import ACOfficeScreen from './src/screens/ACOfficeScreen';
import ACAnnouncementsScreen from './src/screens/ACAnnouncementsScreen';
import ACCNICUploadScreen from './src/screens/ACCNICUploadScreen';
import ACComplaintScreen from './src/screens/ACComplaintScreen';
import ACComplaintHistoryScreen from './src/screens/ACComplaintHistoryScreen';
import ACLoginScreen from './src/screens/ACLoginScreen';
import ACDashboardScreen from './src/screens/ACDashboardScreen';
import ACComplaintDetailScreen from './src/screens/ACComplaintDetailScreen';
import ACCreateAnnouncementScreen from './src/screens/ACCreateAnnouncementScreen';
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
  const { isAuthenticated, loading, setIsNewUser } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [greetingPhase, setGreetingPhase] = useState(0);

  const GREETINGS = [
    { arabic: 'الحمد للہ', transliteration: 'Alhumdulillah', meaning: 'All praise is for Allah' },
    { arabic: 'اللہ اکبر', transliteration: 'Allahu Akbar', meaning: 'Allah is the Greatest' },
    { arabic: 'سبحان اللہ', transliteration: 'SubhanAllah', meaning: 'Glory be to Allah' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Check onboarding status when authentication changes
  useEffect(() => {
    let greetingTimer;
    let phaseTimer;

    if (isAuthenticated) {
      setOnboardingChecked(false);
      // Read the reliable AsyncStorage key set during register()
      AsyncStorage.multiGet(['pendingOnboarding', 'hasSeenOnboarding']).then(([[, pending], [, seen]]) => {
        if (pending === 'true') {
          // Brand new signup: clear the flag, show full onboarding
          AsyncStorage.removeItem('pendingOnboarding');
          setNeedsOnboarding(true);
          setShowGreeting(false);
        } else if (seen !== 'true') {
          // Edge case: hasSeenOnboarding not set yet (rare legacy case)
          setNeedsOnboarding(true);
          setShowGreeting(false);
        } else {
          // Returning user (or re-login): show 3-second cycling greeting
          setNeedsOnboarding(false);
          setGreetingPhase(0);
          setShowGreeting(true);
          // Rotate phrases: 0 → 1 → 2 → hide
          phaseTimer = setTimeout(() => setGreetingPhase(1), 1000);
          greetingTimer = setTimeout(() => {
            setGreetingPhase(2);
            setTimeout(() => setShowGreeting(false), 1000);
          }, 2000);
        }
        setOnboardingChecked(true);
      });
    } else {
      setNeedsOnboarding(false);
      setShowGreeting(false);
      setOnboardingChecked(true);
    }

    return () => {
      if (greetingTimer) clearTimeout(greetingTimer);
      if (phaseTimer) clearTimeout(phaseTimer);
    };
  }, [isAuthenticated]);

  if (showSplash || loading || !onboardingChecked) {
    return <SplashScreen />;
  }

  // Show rotating Islamic greeting for returning users
  if (showGreeting) {
    const g = GREETINGS[greetingPhase];
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>🤲</Text>
        <Text style={{ fontSize: 42, fontWeight: '800', color: '#0C8A43', textAlign: 'center' }}>
          {g.arabic}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginTop: 8, textAlign: 'center' }}>
          {g.transliteration}
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' }}>
          {g.meaning}
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ACLogin" component={ACLoginScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="RestaurantDeals" component={RestaurantDealsScreen} />
          <Stack.Screen name="ClothBrands" component={ClothBrandDealsScreen} />
          <Stack.Screen name="Doctors" component={DoctorsScreen} />
          <Stack.Screen name="ACDashboard" component={ACDashboardScreen} options={{ gestureEnabled: false, headerShown: false }} />
          <Stack.Screen name="ACComplaintDetail" component={ACComplaintDetailScreen} />
          <Stack.Screen name="ACCreateAnnouncement" component={ACCreateAnnouncementScreen} />
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
          
          {/* --- AC Office Screens --- */}
          <Stack.Screen name="ACOffice" component={ACOfficeScreen} />
          <Stack.Screen name="ACAnnouncements" component={ACAnnouncementsScreen} />
          <Stack.Screen name="ACCNICUpload" component={ACCNICUploadScreen} />
          <Stack.Screen name="ACComplaint" component={ACComplaintScreen} />
          <Stack.Screen name="ACComplaintHistory" component={ACComplaintHistoryScreen} />
          <Stack.Screen name="ACLogin" component={ACLoginScreen} />
          <Stack.Screen name="ACDashboard" component={ACDashboardScreen} options={{ gestureEnabled: false, headerShown: false }} />
          <Stack.Screen name="ACComplaintDetail" component={ACComplaintDetailScreen} />
          <Stack.Screen name="ACCreateAnnouncement" component={ACCreateAnnouncementScreen} />

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

  useEffect(() => {
    initAds();

    // Handle notification tap when app is CLOSED or BACKGROUND
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (!navigationRef.current) return;

      // Route based on notification type
      if (data?.type === 'TRADER_APPROVED') {
        navigationRef.current.navigate('Bazar');
      } else if (data?.type === 'APPOINTMENT_APPROVED' || data?.type === 'PAYMENT_CONFIRMED') {
        navigationRef.current.navigate('Doctors');
      } else if (data?.type === 'JOB_APPLICATION') {
        navigationRef.current.navigate('Jobs');
      } else if (data?.type === 'DM_MESSAGE') {
        navigationRef.current.navigate('DMList');
      } else if (data?.type === 'RISHTA_INTEREST' || data?.type === 'RISHTA_ACCEPTED' || data?.type === 'RISHTA_APPROVED' || data?.type === 'RISHTA_REJECTED') {
        navigationRef.current.navigate('Rishta');
      } else {
        navigationRef.current.navigate('Notifications');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <SafeAreaProvider>
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
