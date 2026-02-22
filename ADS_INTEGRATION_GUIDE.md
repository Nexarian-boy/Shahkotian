# Ads Integration Guide for Shahkot App 📱💰

This guide explains how to integrate advertisements into your Shahkot React Native app to monetize it.

---

## 📋 **Table of Contents**
1. [Ad Networks Overview](#ad-networks-overview)
2. [Recommended: Google AdMob](#recommended-google-admob)
3. [Facebook Audience Network](#facebook-audience-network)
4. [Unity Ads](#unity-ads)
5. [Implementation Steps](#implementation-steps)
6. [Best Practices](#best-practices)
7. [Revenue Optimization](#revenue-optimization)

---

## 🎯 **Ad Networks Overview**

### **1. Google AdMob** (Recommended)
- **Best for**: General apps with global audience
- **eCPM**: $0.50 - $10 (Pakistan: $0.30 - $2)
- **Payment**: $100 minimum via EFT/Bank transfer
- **Pros**: Easy integration, reliable payments, good fill rate
- **Cons**: Lower rates in Pakistan compared to USA/Europe

### **2. Facebook Audience Network**
- **Best for**: Apps with good user engagement
- **eCPM**: $0.40 - $8
- **Payment**: $100 minimum via PayPal/Bank
- **Pros**: High eCPM, good targeting
- **Cons**: Strict policies, account bans possible

### **3. Unity Ads**
- **Best for**: Gaming/entertainment apps
- **eCPM**: $0.30 - $12
- **Payment**: $100 minimum via PayPal
- **Pros**: Video ads, rewarded ads
- **Cons**: Better for games than utilities

### **4. AppLovin**
- **Best for**: Apps with 10,000+ daily active users
- **eCPM**: $0.50 - $15
- **Pros**: High rates, cross-promotion
- **Cons**: Requires significant user base

---

## ⭐ **Recommended: Google AdMob Integration**

### **Step 1: Create AdMob Account**

1. Go to https://admob.google.com/
2. Sign in with Google account
3. Click "GET STARTED"
4. Fill in:
   - App name: "Shahkot App"
   - Platform: Android
   - Is your app listed on a supported app store?: No (if not on Play Store yet)

### **Step 2: Create Ad Units**

Create these ad units for your app:

#### **1. Banner Ad** (Bottom of screens)
- Type: Banner
- Name: "Shahkot_Banner_Home"
- Note the **Ad Unit ID** (e.g., `ca-app-pub-1234567890123456/1234567890`)

#### **2. Interstitial Ad** (Between screens)
- Type: Interstitial
- Name: "Shahkot_Interstitial_Main"

#### **3. Rewarded Video** (Optional - for premium features)
- Type: Rewarded
- Name: "Shahkot_Rewarded_RemoveAds"

#### **4. Native Ad** (In-feed, between posts)
- Type: Native Advanced
- Name: "Shahkot_Native_Feed"

### **Step 3: Install React Native AdMob**

```bash
cd ShahkotApp
npm install react-native-google-mobile-ads
npx expo prebuild
```

### **Step 4: Configure AdMob**

Add to `ShahkotApp/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-1234567890123456~1234567890",
          "iosAppId": "ca-app-pub-1234567890123456~0987654321"
        }
      ]
    ]
  }
}
```

### **Step 5: Update Constants**

Add to `ShahkotApp/src/config/constants.js`:

```javascript
// AdMob Configuration
export const ADMOB_CONFIG = {
  // Test IDs for development
  TEST_BANNER: 'ca-app-pub-3940256099942544/6300978111',
  TEST_INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  TEST_REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  
  // Production IDs (replace with your actual IDs)
  BANNER_HOME: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-YOUR_ID/BANNER_ID',
  BANNER_FEED: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-YOUR_ID/BANNER_ID',
  INTERSTITIAL: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-YOUR_ID/INTERSTITIAL_ID',
  NATIVE_FEED: __DEV__ ? 'ca-app-pub-3940256099942544/2247696110' : 'ca-app-pub-YOUR_ID/NATIVE_ID',
  REWARDED: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'ca-app-pub-YOUR_ID/REWARDED_ID',
};
```

### **Step 6: Create Ad Components**

Create `ShahkotApp/src/components/BannerAd.js`:

```javascript
import React from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../config/constants';

export default function BannerAdComponent({ adUnitId = ADMOB_CONFIG.BANNER_HOME }) {
  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
}
```

Create `ShahkotApp/src/components/InterstitialAdHelper.js`:

```javascript
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../config/constants';

const interstitial = InterstitialAd.createForAdRequest(ADMOB_CONFIG.INTERSTITIAL);

let isLoaded = false;

interstitial.addAdEventListener(AdEventType.LOADED, () => {
  isLoaded = true;
});

interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  isLoaded = false;
  interstitial.load(); // Reload for next time
});

// Load initial ad
interstitial.load();

export const showInterstitialAd = () => {
  if (isLoaded) {
    interstitial.show();
  } else {
    interstitial.load();
  }
};
```

### **Step 7: Implement Ads in Screens**

#### **Add Banner to HomeScreen**:

```javascript
import BannerAd from '../components/BannerAd';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Your existing content */}
      
      {/* Banner Ad at bottom */}
      <BannerAd />
    </View>
  );
}
```

#### **Show Interstitial Between Navigations**:

```javascript
import { showInterstitialAd } from '../components/InterstitialAdHelper';

// In your navigation handler
const handleNavigateToDetail = (item) => {
  showInterstitialAd(); // Show ad
  navigation.navigate('Detail', { item });
};
```

#### **Native Ads in Feed** (Between Posts):

```javascript
import { NativeAd, NativeMediaView } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../config/constants';

// In your FlatList renderItem
const renderItem = ({ item, index }) => {
  // Show ad every 5 posts
  if (index > 0 && index % 5 === 0) {
    return (
      <NativeAd
        unitId={ADMOB_CONFIG.NATIVE_FEED}
        renderAd={({ headline, body, image, advertiser }) => (
          <View style={styles.nativeAdContainer}>
            <Text style={styles.adBadge}>Sponsored</Text>
            {image && <Image source={{ uri: image }} style={styles.adImage} />}
            <Text style={styles.adHeadline}>{headline}</Text>
            <Text style={styles.adBody}>{body}</Text>
            <Text style={styles.adAdvertiser}>{advertiser}</Text>
          </View>
        )}
      />
    );
  }
  
  return <PostCard post={item} />;
};
```

---

## 💡 **Best Practices**

### **1. Ad Placement Strategy**

#### **✅ Good Placements:**
- **Banner**: Bottom of HomeScreen, ExploreScreen
- **Interstitial**: After viewing 3-4 posts, between major navigations
- **Native**: Every 5th post in FeedScreen, MarketplaceScreen
- **Rewarded**: Offer "Remove ads for 24 hours" or "Unlock premium feature"

#### **❌ Avoid:**
- Too many ads (frustrates users)
- Ads during checkout/purchase flows
- Ads on LoginScreen or SplashScreen
- Full-screen ads every time user navigates

### **2. User Experience First**

```javascript
// Track ad impressions to limit frequency
let adImpressionCount = 0;
const MAX_ADS_PER_SESSION = 10;

const showAdIfAllowed = () => {
  if (adImpressionCount < MAX_ADS_PER_SESSION) {
    showInterstitialAd();
    adImpressionCount++;
  }
};
```

### **3. Implement Premium (Ad-Free) Option**

Add a "Remove Ads" in-app purchase:
- Price: PKR 500-1000 ($2-5)
- Users pay once to remove all ads forever
- Can generate more revenue than ads for engaged users

```javascript
// In ProfileScreen
const [isPremium, setIsPremium] = useState(false);

// Only show ads if not premium
{!isPremium && <BannerAd />}
```

### **4. Test Ads Thoroughly**

Always use **test ad IDs** during development:
```javascript
const AD_ID = __DEV__ ? TestIds.BANNER : ADMOB_CONFIG.BANNER_HOME;
```

---

## 📊 **Revenue Optimization**

### **Expected Revenue (Shahkot App)**

Assuming:
- 1,000 daily active users
- 10 ad impressions per user per day
- eCPM: $0.50 (Pakistan average)

**Calculation:**
```
Daily: 1,000 users × 10 impressions × $0.50 / 1000 = $5/day
Monthly: $5 × 30 = $150/month
Yearly: $150 × 12 = $1,800/year
```

With **10,000 DAU**: ~$18,000/year  
With **100,000 DAU**: ~$180,000/year

### **Increase Revenue:**

1. **Improve eCPM**:
   - Enable personalized ads (GDPR compliant)
   - Target high-value categories (finance, real estate)
   - Use mediation (multiple ad networks)

2. **Increase Impressions**:
   - More engaging content (users spend more time)
   - Better UI (smooth navigation = more pageviews)
   - Push notifications (bring users back)

3. **Hybrid Monetization**:
   - Ads for free users
   - Premium subscription ($2-5/month)
   - In-app purchases for features

---

## 🔧 **Alternative: Ad Mediation**

Use multiple ad networks for better fill rate and eCPM:

### **Setup AdMob Mediation**:

1. In AdMob dashboard → Mediation
2. Add Facebook Audience Network
3. Add Unity Ads
4. Set eCPM floors

This automatically chooses the highest-paying ad from multiple networks.

---

## 🚀 **Publishing & Ads**

### **Google Play Store Requirements**

1. **Add Privacy Policy** (Required for AdMob):
   - Create privacy policy at https://app-privacy-policy-generator.firebaseapp.com/
   - Upload to your website
   - Add URL in Play Store listing

2. **Content Rating**:
   - Complete Google's questionnaire
   - Declare ads in app

3. **Permissions**:
   - `INTERNET` (already in your app)
   - `ACCESS_NETWORK_STATE`

### **AdMob Policy Compliance**

✅ **Allowed**:
- Ads in free app
- Rewarded ads
- Native ads

❌ **Not Allowed**:
- Click fraud (fake clicks)
- Misleading ad placement
- Adult content
- Ads in paid apps

---

## 📞 **Getting Paid**

### **AdMob Payments**:
1. Earnings: $0.50 - $2 per 1000 impressions (Pakistan)
2. Payment threshold: $100
3. Payment methods: 
   - Bank transfer (EasyPaisa/JazzCash account)
   - Wire transfer (Bank account required)
4. Payment schedule: Monthly (NET-30)

### **Setup Payment**:
1. AdMob → Payments
2. Add payment info
3. Verify address (they mail a PIN)
4. Start earning!

---

## 🎓 **Learning Resources**

- [AdMob Official Docs](https://developers.google.com/admob)
- [React Native Google Mobile Ads](https://docs.page/invertase/react-native-google-mobile-ads)
- [AdMob Best Practices](https://support.google.com/admob/answer/6128738)

---

## ⚠️ **Important Notes**

1. **Don't click your own ads** - AdMob will ban your account
2. **Use test ads during development** - Always
3. **Respect user privacy** - Ask for consent (GDPR)
4. **Don't overdo it** - Too many ads = users uninstall
5. **Monitor performance** - Check AdMob dashboard daily

---

## 🎯 **Quick Start Checklist**

- [ ] Create AdMob account
- [ ] Add your app to AdMob
- [ ] Create ad units (Banner, Interstitial, Native)
- [ ] Install react-native-google-mobile-ads
- [ ] Add AdMob IDs to constants.js
- [ ] Create ad components
- [ ] Implement ads in 3-5 key screens
- [ ] Test with test IDs
- [ ] Replace with real IDs before production
- [ ] Create privacy policy
- [ ] Publish app to Play Store
- [ ] Setup payment info in AdMob
- [ ] Start earning! 💰

---

**Good luck with monetization! 🚀**

For questions, check AdMob support or React Native community forums.
