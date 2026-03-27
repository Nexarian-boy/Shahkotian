import AsyncStorage from '@react-native-async-storage/async-storage';
import { publicConfigAPI } from '../services/api';

const ADS_CACHE_KEY = 'ads_enabled_cache';

let adsEnabled = true;
let initialised = false;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => {
    try {
      listener(adsEnabled);
    } catch (e) {
      // No-op: a bad listener should not break global config updates.
    }
  });
}

export function getAdsEnabled() {
  return adsEnabled;
}

export function subscribeAdsEnabled(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function refreshAdsEnabled() {
  try {
    const res = await publicConfigAPI.getPublicConfig();
    const remoteValue = res?.data?.adsEnabled;
    if (typeof remoteValue === 'boolean' && remoteValue !== adsEnabled) {
      adsEnabled = remoteValue;
      emit();
    }
    if (typeof remoteValue === 'boolean') {
      await AsyncStorage.setItem(ADS_CACHE_KEY, remoteValue ? 'true' : 'false');
    }
    return adsEnabled;
  } catch (e) {
    return adsEnabled;
  }
}

export async function initAdsEnabled() {
  if (initialised) return adsEnabled;
  initialised = true;

  try {
    const cached = await AsyncStorage.getItem(ADS_CACHE_KEY);
    if (cached === 'true' || cached === 'false') {
      adsEnabled = cached === 'true';
      emit();
    }
  } catch (e) {
    // Ignore cache read issues and continue with defaults.
  }

  await refreshAdsEnabled();
  return adsEnabled;
}
