import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

// ─── Ad Unit IDs ──────────────────────────────────────────────────────────────
// Step 1: Create your AdMob account at https://admob.google.com
// Step 2: Create Banner ad units for Android & iOS
// Step 3: Set USE_TEST_IDS = false and fill in REAL_* values below
// Step 4: Also update app.json androidAppId / iosAppId with your real App IDs

const USE_TEST_IDS = false; // ← using real production IDs

// Google official test IDs (safe to use during development)
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_BANNER_IOS     = 'ca-app-pub-3940256099942544/2934735716';

// Real AdMob ad unit IDs
export const REAL_BANNER_ANDROID = 'ca-app-pub-9583068113931056/6555811508';
export const REAL_BANNER_IOS     = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'; // not used yet

const BANNER_ID = Platform.select({
  android: USE_TEST_IDS ? TEST_BANNER_ANDROID : REAL_BANNER_ANDROID,
  ios:     USE_TEST_IDS ? TEST_BANNER_IOS     : REAL_BANNER_IOS,
  default: TEST_BANNER_ANDROID,
});

// ─── Detect Expo Go (ads need a custom EAS Build, not Expo Go) ────────────────
const isExpoGo = Constants.appOwnership === 'expo';

// ─── Load AdMob only in real builds (not Expo Go) ─────────────────────────────
let BannerAd = null;
let BannerAdSize = null;

if (!isExpoGo) {
  try {
    const admob = require('react-native-google-mobile-ads');
    BannerAd = admob.BannerAd;
    BannerAdSize = admob.BannerAdSize;
  } catch (e) {
    console.log('AdMob not available:', e.message);
  }
}

// ─── AdBanner Component ───────────────────────────────────────────────────────
export default function AdBanner({ size = 'BANNER' }) {
  // In Expo Go: show a dashed placeholder so layout is visible during testing
  if (isExpoGo) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📢 Ad — visible in production build</Text>
      </View>
    );
  }

  if (!BannerAd || !BannerAdSize) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={BANNER_ID}
        size={BannerAdSize[size] ?? BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => {}}
        onAdFailedToLoad={(err) => console.log('AdMob load error:', err?.message)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 6,
  },
  placeholder: {
    height: 52,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A5D6A7',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 11,
    color: '#388E3C',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
