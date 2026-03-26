import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList,
  Alert, ActivityIndicator, RefreshControl, TextInput, Image, Modal,
  KeyboardAvoidingView, Platform, Linking, Dimensions, Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';
import { clothBrandsAPI } from '../services/api';
import AdBanner from '../components/AdBanner';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

function Toast({ visible, message, onHide }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => onHide?.());
  }, [visible, opacity, onHide]);

  if (!visible) return null;
  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <View style={styles.toastContent}>
        <Ionicons name="checkmark-circle" size={18} color="#FFF" />
        <Text style={styles.toastText} numberOfLines={2}>{message}</Text>
      </View>
    </Animated.View>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: '60%' }]} />
        <View style={styles.skeletonFooter} />
      </View>
    </View>
  );
}

export default function ClothBrandDealsScreen({ navigation, route }) {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [allDeals, setAllDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('deals');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Add brand form
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formLocationLink, setFormLocationLink] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formImage, setFormImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Owner state
  const [ownerToken, setOwnerToken] = useState(null);
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [ownerLoginLoading, setOwnerLoginLoading] = useState(false);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [dealTitle, setDealTitle] = useState('');
  const [dealDesc, setDealDesc] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [dealOriginalPrice, setDealOriginalPrice] = useState('');
  const [dealMedia, setDealMedia] = useState([]); // images + optional video
  const [dealSubmitting, setDealSubmitting] = useState(false);
  const [showOwnerLoginModal, setShowOwnerLoginModal] = useState(false);

  // Image viewer (for deal photos)
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerImages, setImageViewerImages] = useState([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  // Video viewer (for deal videos)
  const [videoViewerVisible, setVideoViewerVisible] = useState(false);
  const [videoViewerUrl, setVideoViewerUrl] = useState(null);

  useEffect(() => {
    loadData();
    const p = route?.params;
    if (p?.ownerToken && p?.ownerProfile) {
      setOwnerToken(p.ownerToken);
      setOwnerProfile(p.ownerProfile);
      setActiveTab('owner');
    }
  }, []);

  const openImageViewer = (images = [], index = 0) => {
    if (!Array.isArray(images) || images.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, images.length - 1));
    setImageViewerImages(images);
    setImageViewerIndex(safeIndex);
    setImageViewerVisible(true);
  };

  const openVideoViewer = (url) => {
    if (!url) return;
    setVideoViewerUrl(url);
    setVideoViewerVisible(true);
  };

  const showToast = (message) => setToast({ visible: true, message });

  const loadData = async () => {
    try {
      const [brandRes, dealsRes] = await Promise.allSettled([
        clothBrandsAPI.getAll(search ? { search } : {}),
        clothBrandsAPI.getAllDeals(),
      ]);
      if (brandRes.status === 'fulfilled') setBrands(brandRes.value.data.brands || []);
      if (dealsRes.status === 'fulfilled') setAllDeals(dealsRes.value.data.deals || []);
    } catch (err) {
      console.error('Load brands error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [search]);

  const loadBrandDetail = async (id) => {
    try {
      const res = await clothBrandsAPI.getOne(id);
      setSelectedBrand(res.data);
    } catch {
      Alert.alert(t('error'), 'Could not load brand details.');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setFormImage(result.assets[0]);
  };

  const handleAddBrand = async () => {
    if (!formName.trim() || !formAddress.trim() || !formEmail.trim() || !formPassword.trim()) {
      return Alert.alert(t('required'), 'Name, address, email, and password are required.');
    }
    if (formPassword.length < 6) {
      return Alert.alert(t('error'), 'Password must be at least 6 characters.');
    }

    const trimmedLocationLink = formLocationLink.trim();
    if (trimmedLocationLink && !/^https?:\/\//i.test(trimmedLocationLink)) {
      return Alert.alert('Invalid link', 'Location link must start with http:// or https://');
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', formName.trim());
      formData.append('address', formAddress.trim());
      formData.append('locationLink', trimmedLocationLink);
      formData.append('phone', formPhone.trim());
      formData.append('whatsapp', formWhatsapp.trim());
      formData.append('description', formDesc.trim());
      formData.append('email', formEmail.trim());
      formData.append('password', formPassword.trim());
      if (formImage) {
        formData.append('image', { uri: formImage.uri, type: 'image/jpeg', name: 'brand.jpg' });
      }
      const res = await clothBrandsAPI.adminCreate(formData);
      Alert.alert(t('done') + ' 🎉', `${res.data.brand.name} added.\n\nLogin: ${res.data.brand.email}\nPassword: ${formPassword.trim()}\n\nShare these credentials with the brand owner.`);
      setShowAddBrand(false);
      resetForm();
      loadData();
    } catch (err) {
      Alert.alert(t('error'), err.response?.data?.error || 'Failed to create brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = (id, name) => {
    Alert.alert(t('deleteBrand') || 'Delete Brand', `Remove "${name}" and all its deals?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive',
        onPress: async () => {
          try {
            await clothBrandsAPI.adminDelete(id);
            Alert.alert(t('deleted'), 'Brand removed.');
            loadData();
            setSelectedBrand(null);
          } catch {
            Alert.alert(t('error'), 'Failed to delete.');
          }
        },
      },
    ]);
  };

  const toggleBrand = async (id, currentActive) => {
    try {
      await clothBrandsAPI.adminUpdate(id, { isActive: !currentActive });
      loadData();
    } catch {
      Alert.alert(t('error'), 'Failed to update.');
    }
  };

  const resetForm = () => {
    setFormName(''); setFormAddress(''); setFormLocationLink(''); setFormPhone(''); setFormWhatsapp('');
    setFormDesc(''); setFormEmail(''); setFormPassword(''); setFormImage(null);
  };

  // ── Owner: login ──────────────────────────────────────────────────────
  const handleOwnerLogin = async () => {
    if (!ownerEmail.trim() || !ownerPassword.trim()) {
      return Alert.alert(t('required'), 'Please enter your email and password.');
    }
    setOwnerLoginLoading(true);
    try {
      const res = await clothBrandsAPI.ownerLogin({ email: ownerEmail.trim(), password: ownerPassword.trim() });
      const token = res.data.token;
      setOwnerToken(token);
      const profileRes = await clothBrandsAPI.ownerProfile(token);
      setOwnerProfile(profileRes.data);
      setShowOwnerLoginModal(false);
      setActiveTab('owner');
    } catch (err) {
      Alert.alert(t('loginFailed'), err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setOwnerLoginLoading(false);
    }
  };

  const handleOwnerLogout = () => {
    setOwnerToken(null); setOwnerProfile(null);
    setOwnerEmail(''); setOwnerPassword('');
    setActiveTab('deals');
  };

  const reloadOwnerProfile = async () => {
    if (!ownerToken) return;
    try {
      const res = await clothBrandsAPI.ownerProfile(ownerToken);
      setOwnerProfile(res.data);
    } catch {}
  };

  // ── Owner: pick media (images + video) ────────────────────────────────
  const pickDealMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
      videoMaxDuration: 120,
    });
    if (!result.canceled) {
      setDealMedia(result.assets.slice(0, 6));
    }
  };

  // ── Owner: add deal ───────────────────────────────────────────────────
  const handleAddDeal = async () => {
    if (!dealTitle.trim()) return Alert.alert(t('required'), 'Deal title is required.');
    setDealSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', dealTitle.trim());
      fd.append('description', dealDesc.trim());
      fd.append('price', dealPrice.trim());
      fd.append('originalPrice', dealOriginalPrice.trim());
      dealMedia.forEach((asset, i) => {
        const isVideo = asset.type === 'video';
        fd.append('media', {
          uri: asset.uri,
          type: isVideo ? 'video/mp4' : 'image/jpeg',
          name: isVideo ? `deal_video_${i}.mp4` : `deal_img_${i}.jpg`,
        });
      });
      await clothBrandsAPI.ownerCreateDeal(ownerToken, fd);
      Alert.alert(t('done') + ' 🎉', t('dealAdded'));
      setShowAddDeal(false);
      setDealTitle(''); setDealDesc(''); setDealPrice(''); setDealOriginalPrice(''); setDealMedia([]);
      reloadOwnerProfile();
      loadData();
    } catch (err) {
      Alert.alert(t('error'), err.response?.data?.error || 'Failed to add deal.');
    } finally {
      setDealSubmitting(false);
    }
  };

  const handleDeleteDeal = (dealId) => {
    Alert.alert(t('deleteDeal') || 'Delete Deal', t('deleteDealConfirm') || 'Remove this deal?', [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'), style: 'destructive', onPress: async () => {
          try {
            await clothBrandsAPI.ownerDeleteDeal(ownerToken, dealId);
            reloadOwnerProfile();
            loadData();
          } catch {
            Alert.alert(t('error'), 'Failed to delete deal.');
          }
        },
      },
    ]);
  };

  const callPhone = (phone) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const openWhatsApp = (whatsapp) => {
    if (whatsapp) {
      const num = whatsapp.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/${num}`);
    }
  };

  const openLocationLink = async (locationLink) => {
    if (!locationLink) return;
    try {
      await Linking.openURL(locationLink);
    } catch {
      Alert.alert('Error', 'Could not open location link.');
    }
  };

  const toggleDealLike = async (dealId) => {
    try {
      const res = await clothBrandsAPI.likeDeal(dealId);
      setAllDeals(prev => prev.map(d => (
        d.id === dealId
          ? {
            ...d,
            likedBy: res.data.liked
              ? [...(d.likedBy || []), 'me']
              : (d.likedBy || []).filter(id => id !== 'me'),
          }
          : d
      )));
      showToast('Saved ❤️');
    } catch {}
  };

  // Render deal card
  const renderDealCard = ({ item }) => {
    if (item.type === 'AD_ITEM') return <AdBanner />;
    const cardImages = (item.images?.length ? item.images : []);
    const isLiked = (item.likedBy || []).includes('me');
    return (
      <TouchableOpacity
        style={styles.dealCardNew}
        onPress={() => {
          clothBrandsAPI.viewDeal(item.id).then((res) => {
            const views = res?.data?.views;
            if (typeof views === 'number') {
              setAllDeals(prev => prev.map(d => (d.id === item.id ? { ...d, views } : d)));
            }
          }).catch(() => {});
          loadBrandDetail(item.brand?.id || item.brandId);
        }}
        activeOpacity={0.95}
      >
        <View style={styles.dealMediaNew}>
          {cardImages?.[0] ? (
            <TouchableOpacity activeOpacity={0.95} onPress={() => openImageViewer(cardImages, 0)}>
              <Image source={{ uri: cardImages[0] }} style={styles.dealImageNew} />
            </TouchableOpacity>
          ) : (
            <View style={[styles.dealImageNew, styles.dealImagePlaceholder]}>
              <Ionicons name="shirt" size={40} color="#9CA3AF" />
            </View>
          )}

          <LinearGradient
            colors={['rgba(0,0,0,0.55)', 'transparent']}
            style={styles.dealGradientTop}
            pointerEvents="none"
          />

          {item.videos?.[0] ? (
            <TouchableOpacity style={styles.playOverlayBtn} onPress={() => openVideoViewer(item.videos[0])} activeOpacity={0.9}>
              <Ionicons name="play" size={22} color="#FFF" />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={[styles.saveOverlayBtn, isLiked && { backgroundColor: 'rgba(239,68,68,0.20)' }]}
            onPress={() => toggleDealLike(item.id)}
            activeOpacity={0.85}
          >
            <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? '#EF4444' : '#FFF'} />
          </TouchableOpacity>
        </View>

        <View style={styles.dealBodyNew}>
          <View style={styles.dealHeaderRowNew}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.dealTitleNew} numberOfLines={2}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.dealDescNew} numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {item.price ? <Text style={styles.currentPriceNew}>{item.price}</Text> : null}
              {item.originalPrice ? <Text style={styles.originalPriceNew}>{item.originalPrice}</Text> : null}
            </View>
          </View>

          <View style={styles.statsRowNew}>
            <View style={styles.statItemNew}>
              <Ionicons name="heart" size={14} color="#EF4444" />
              <Text style={styles.statTextNew}>{item.likedBy?.length || 0}</Text>
            </View>
            <View style={styles.statItemNew}>
              <Ionicons name="eye" size={14} color="#6B7280" />
              <Text style={styles.statTextNew}>{item.views || 0}</Text>
            </View>
            {item.expiresAt ? (
              <View style={styles.statItemNew}>
                <Ionicons name="time" size={14} color="#F59E0B" />
                <Text style={[styles.statTextNew, { color: '#F59E0B' }]}>
                  {new Date(item.expiresAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.dealFooterNew}>
            <TouchableOpacity style={styles.brandRowNew} onPress={() => loadBrandDetail(item.brand?.id || item.brandId)} activeOpacity={0.9}>
              {item.brand?.image ? (
                <Image source={{ uri: item.brand.image }} style={styles.brandAvatarNew} />
              ) : (
                <View style={styles.brandAvatarFallback}>
                  <Text style={styles.brandAvatarLetter}>
                    {(item.brand?.name || 'B').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.brandNameNew} numberOfLines={1}>{item.brand?.name || 'Brand'}</Text>
                <Text style={styles.brandAddrNew} numberOfLines={1}>📍 {item.brand?.address || ''}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dealActionsRight}>
              {item.brand?.locationLink ? (
                <TouchableOpacity style={styles.iconCircleBtn} onPress={() => openLocationLink(item.brand.locationLink)} activeOpacity={0.9}>
                  <Ionicons name="location" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              ) : null}
              {item.brand?.phone ? (
                <TouchableOpacity style={styles.callChip} onPress={() => callPhone(item.brand.phone)} activeOpacity={0.9}>
                  <Ionicons name="call" size={14} color="#FFF" />
                  <Text style={styles.callChipText}>Call</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render brand card
  const renderBrandCard = ({ item }) => {
    if (item.type === 'AD_ITEM') return <AdBanner />;
    return (
      <TouchableOpacity style={styles.brandCard} onPress={() => loadBrandDetail(item.id)}>
        <View style={styles.brandHeader}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.brandImage} />
          ) : (
            <View style={[styles.brandImage, styles.brandPlaceholder]}>
              <Text style={{ fontSize: 28 }}>👔</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.brandCardName}>{item.name}</Text>
            <Text style={styles.brandAddress} numberOfLines={1}>📍 {item.address}</Text>
            <Text style={styles.brandDeals}>{item._count?.deals || 0} {t('activeDeals')}</Text>
          </View>
        </View>
        {(item.phone || item.whatsapp || item.locationLink) && (
          <View style={styles.contactRow}>
            {item.phone && (
              <TouchableOpacity style={styles.contactBtn} onPress={() => callPhone(item.phone)}>
                <Ionicons name="call" size={16} color={COLORS.primary} />
                <Text style={styles.contactText}>Call</Text>
              </TouchableOpacity>
            )}
            {item.whatsapp && (
              <TouchableOpacity style={[styles.contactBtn, { borderColor: '#25D366' }]} onPress={() => openWhatsApp(item.whatsapp)}>
                <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                <Text style={[styles.contactText, { color: '#25D366' }]}>WhatsApp</Text>
              </TouchableOpacity>
            )}
            {item.locationLink && (
              <TouchableOpacity style={styles.contactBtn} onPress={() => openLocationLink(item.locationLink)}>
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <Text style={styles.contactText}>Map</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={[styles.adminBtn, { borderColor: item.isActive ? '#EF4444' : '#10B981' }]}
              onPress={() => toggleBrand(item.id, item.isActive)}
            >
              <Text style={{ color: item.isActive ? '#EF4444' : '#10B981', fontSize: 12, fontWeight: '600' }}>
                {item.isActive ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.adminBtn, { borderColor: '#EF4444' }]}
              onPress={() => handleDeleteBrand(item.id, item.name)}
            >
              <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.primary, '#047857']} style={styles.headerNew}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitleNew}>{t('brandsTitle') || 'Cloth Brands & Deals'}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>
        <View style={{ padding: 12 }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, '#047857']} style={styles.headerNew}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitleNew}>{t('brandsTitle') || 'Cloth Brands & Deals'}</Text>
        <View style={styles.headerBtn} />
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsWrapNew}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollNew}>
          {[
            { key: 'deals', icon: 'flame', label: 'Deals', badge: allDeals.length },
            { key: 'brands', icon: 'shirt', label: 'Brands', badge: null },
            ...(ownerToken ? [{ key: 'owner', icon: 'person-circle', label: 'Owner', badge: 'NEW' }] : []),
            ...(isAdmin ? [{ key: 'admin', icon: 'settings', label: 'Admin', badge: null }] : []),
          ].map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabNew, active && styles.tabNewActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.85}
              >
                <Ionicons name={tab.icon} size={18} color={active ? COLORS.primary : '#6B7280'} />
                <Text style={[styles.tabNewText, active && styles.tabNewTextActive]}>{tab.label}</Text>
                {tab.badge != null ? (
                  <View style={[styles.tabBadgeNew, typeof tab.badge === 'string' && { backgroundColor: '#F59E0B' }]}>
                    <Text style={styles.tabBadgeNewText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Deals Tab */}
      {activeTab === 'deals' && (
        <FlatList
          data={(() => { const out = []; allDeals.forEach((d, i) => { out.push(d); if ((i + 1) % 4 === 0) out.push({ id: `ad-deal-${i}`, type: 'AD_ITEM' }); }); return out; })()}
          keyExtractor={(item) => item.id}
          renderItem={renderDealCard}
          contentContainerStyle={{ padding: 12 }}
          ListHeaderComponent={<AdBanner />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>👔</Text>
              <Text style={styles.emptyText}>{t('noDealsYet')}</Text>
              <Text style={styles.emptySubText}>{t('checkBackLaterDeals')}</Text>
            </View>
          }
        />
      )}

      {/* Brands Tab */}
      {activeTab === 'brands' && (
        <FlatList
          data={(() => { const out = []; brands.forEach((r, i) => { out.push(r); if ((i + 1) % 4 === 0) out.push({ id: `ad-brand-${i}`, type: 'AD_ITEM' }); }); return out; })()}
          keyExtractor={(item) => item.id}
          renderItem={renderBrandCard}
          contentContainerStyle={{ padding: 12 }}
          ListHeaderComponent={<AdBanner />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🏪</Text>
              <Text style={styles.emptyText}>{t('noBrandsYet')}</Text>
            </View>
          }
          ListFooterComponent={
            !ownerToken ? (
              <TouchableOpacity
                onPress={() => setShowOwnerLoginModal(true)}
                style={{ alignItems: 'center', paddingVertical: 24 }}
              >
                <Text style={{ fontSize: 12, color: COLORS.textLight }}>{t('brandOwnerPrompt')}</Text>
                <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 }}>{t('loginToManage')}</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}

      {/* Owner Tab */}
      {activeTab === 'owner' && ownerToken && (
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={styles.sectionTitle}>👔 {ownerProfile?.name}</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>📍 {ownerProfile?.address}</Text>
            </View>
            <TouchableOpacity onPress={handleOwnerLogout} style={{ padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8 }}>
              <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700' }}>Logout</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddDeal(true)}>
            <Ionicons name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.addBtnText}>{t('addNewDeal')}</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
            Your Deals ({ownerProfile?.deals?.length || 0})
          </Text>

          {(!ownerProfile?.deals || ownerProfile.deals.length === 0) ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🏷️</Text>
              <Text style={styles.emptyText}>No deals yet</Text>
              <Text style={styles.emptySubText}>Tap "Add New Deal" to create your first deal</Text>
            </View>
          ) : (
            ownerProfile.deals.map(deal => (
              <View key={deal.id} style={[styles.adminCard, { borderLeftWidth: 3, borderLeftColor: deal.isActive ? '#10B981' : '#EF4444' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.adminCardName}>{deal.title}</Text>
                    {deal.description ? <Text style={styles.adminCardSub}>{deal.description}</Text> : null}
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                      {deal.originalPrice ? <Text style={{ fontSize: 12, color: COLORS.textLight, textDecorationLine: 'line-through' }}>{deal.originalPrice}</Text> : null}
                      {deal.price ? <Text style={{ fontSize: 13, fontWeight: '700', color: '#10B981' }}>{deal.price}</Text> : null}
                    </View>
                    {deal.images?.length > 0 && (
                      <Text style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>📷 {deal.images.length} image(s)</Text>
                    )}
                    {deal.videos?.length > 0 && (
                      <Text style={{ fontSize: 11, color: COLORS.textLight }}>🎥 {deal.videos.length} video(s)</Text>
                    )}
                    <Text style={[styles.adminCardSub, { color: deal.isActive ? '#10B981' : '#EF4444', marginTop: 4 }]}>
                      {deal.isActive ? '✅ Active' : '❌ Inactive'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteDeal(deal.id)}
                    style={{ padding: 8, backgroundColor: '#FEE2E2', borderRadius: 8, marginLeft: 8 }}
                  >
                    <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '700' }}>🗑️ Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Admin Tab */}
      {activeTab === 'admin' && isAdmin && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddBrand(true)}>
            <Ionicons name="add-circle" size={22} color={COLORS.white} />
            <Text style={styles.addBtnText}>{t('addNewBrand')}</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>{t('allBrands') || 'All Brands'} ({brands.length})</Text>
          {brands.map((r) => (
            <View key={r.id} style={styles.adminCard}>
              <Text style={styles.adminCardName}>{r.name}</Text>
              <Text style={styles.adminCardSub}>📍 {r.address}</Text>
              <Text style={styles.adminCardSub}>📧 Active deals: {r._count?.deals || 0}</Text>
              <Text style={[styles.adminCardSub, { color: r.isActive ? '#10B981' : '#EF4444' }]}>
                {r.isActive ? '✅ Active' : '❌ Deactivated'}
              </Text>
              <View style={styles.adminActions}>
                <TouchableOpacity
                  style={[styles.adminBtn, { borderColor: r.isActive ? '#EF4444' : '#10B981' }]}
                  onPress={() => toggleBrand(r.id, r.isActive)}
                >
                  <Text style={{ color: r.isActive ? '#EF4444' : '#10B981', fontSize: 12, fontWeight: '600' }}>
                    {r.isActive ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.adminBtn, { borderColor: '#EF4444' }]}
                  onPress={() => handleDeleteBrand(r.id, r.name)}
                >
                  <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '600' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Brand Detail Modal */}
      <Modal visible={!!selectedBrand} animationType="slide" transparent onRequestClose={() => setSelectedBrand(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedBrand(null)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>

            {selectedBrand && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedBrand.image && (
                  <Image source={{ uri: selectedBrand.image }} style={styles.detailImage} />
                )}
                <Text style={styles.detailName}>{selectedBrand.name}</Text>
                <Text style={styles.detailAddr}>📍 {selectedBrand.address}</Text>
                {selectedBrand.description && (
                  <Text style={styles.detailDesc}>{selectedBrand.description}</Text>
                )}

                {(selectedBrand.phone || selectedBrand.whatsapp || selectedBrand.locationLink) && (
                  <View style={styles.contactRow}>
                    {selectedBrand.phone && (
                      <TouchableOpacity style={styles.contactBtn} onPress={() => callPhone(selectedBrand.phone)}>
                        <Ionicons name="call" size={16} color={COLORS.primary} />
                        <Text style={styles.contactText}>{selectedBrand.phone}</Text>
                      </TouchableOpacity>
                    )}
                    {selectedBrand.whatsapp && (
                      <TouchableOpacity style={[styles.contactBtn, { borderColor: '#25D366' }]} onPress={() => openWhatsApp(selectedBrand.whatsapp)}>
                        <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                        <Text style={[styles.contactText, { color: '#25D366' }]}>WhatsApp</Text>
                      </TouchableOpacity>
                    )}
                    {selectedBrand.locationLink && (
                      <TouchableOpacity style={styles.contactBtn} onPress={() => openLocationLink(selectedBrand.locationLink)}>
                        <Ionicons name="location" size={16} color={COLORS.primary} />
                        <Text style={styles.contactText}>Map</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <Text style={styles.dealsHeader}>
                  🔥 Active Deals ({selectedBrand.deals?.length || 0})
                </Text>

                {(selectedBrand.deals || []).map(deal => (
                  <View key={deal.id} style={styles.detailDeal}>
                    {deal.images?.[0] && (
                      <TouchableOpacity activeOpacity={0.9} onPress={() => openImageViewer(deal.images || [], 0)}>
                        <Image source={{ uri: deal.images[0] }} style={styles.detailDealImage} />
                      </TouchableOpacity>
                    )}
                    {deal.images?.length > 1 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                        {deal.images.slice(1).map((img, idx) => (
                          <TouchableOpacity
                            key={idx}
                            activeOpacity={0.9}
                            onPress={() => openImageViewer(deal.images || [], idx + 1)}
                            style={{ marginRight: 8 }}
                          >
                            <Image source={{ uri: img }} style={{ width: 100, height: 80, borderRadius: 8 }} />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                    <Text style={styles.detailDealTitle}>{deal.title}</Text>
                    {deal.description && <Text style={styles.detailDealDesc}>{deal.description}</Text>}
                    <View style={styles.priceRow}>
                      {deal.originalPrice && <Text style={styles.originalPrice}>{deal.originalPrice}</Text>}
                      {deal.price && <Text style={styles.dealPrice}>{deal.price}</Text>}
                    </View>
                    {deal.videos?.length > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                        <Ionicons name="videocam" size={14} color={COLORS.primary} />
                        <Text style={{ fontSize: 12, color: COLORS.primary }}>{deal.videos.length} video(s)</Text>
                      </View>
                    )}
                  </View>
                ))}

                {(!selectedBrand.deals || selectedBrand.deals.length === 0) && (
                  <Text style={styles.emptySubText}>{t('noActiveDeals')}</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Deal Image Viewer */}
      <Modal
        visible={imageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerTopBar}>
            <Text style={styles.viewerCounter}>
              {(imageViewerIndex || 0) + 1}/{imageViewerImages.length || 0}
            </Text>
            <TouchableOpacity
              onPress={() => setImageViewerVisible(false)}
              style={styles.viewerCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={imageViewerImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, idx) => `${uri}-${idx}`}
            initialScrollIndex={imageViewerIndex}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onMomentumScrollEnd={(e) => {
              const next = Math.round(e.nativeEvent.contentOffset.x / width);
              setImageViewerIndex(next);
            }}
            renderItem={({ item: uri }) => (
              <View style={styles.viewerPage}>
                <Image source={{ uri }} style={styles.viewerImage} resizeMode="contain" />
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Deal Video Viewer */}
      <Modal
        visible={videoViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => { setVideoViewerVisible(false); setVideoViewerUrl(null); }}
      >
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerTopBar}>
            <Text style={styles.viewerCounter}>Video</Text>
            <TouchableOpacity
              onPress={() => { setVideoViewerVisible(false); setVideoViewerUrl(null); }}
              style={styles.viewerCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.viewerPage}>
            {videoViewerUrl ? (
              <Video
                source={{ uri: videoViewerUrl }}
                style={styles.viewerVideo}
                useNativeControls
                resizeMode="contain"
                shouldPlay
              />
            ) : null}
          </View>
        </View>
      </Modal>

      {/* Add Brand Modal */}
      <Modal visible={showAddBrand} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.detailName}>Add Brand</Text>
                <TouchableOpacity onPress={() => { setShowAddBrand(false); resetForm(); }}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TextInput style={styles.input} placeholder={t('brandName')} value={formName} onChangeText={setFormName} placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} placeholder={t('restaurantAddress')} value={formAddress} onChangeText={setFormAddress} placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} placeholder="Google Maps Link (optional)" value={formLocationLink} onChangeText={setFormLocationLink} keyboardType="url" autoCapitalize="none" placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} placeholder="Phone" value={formPhone} onChangeText={setFormPhone} keyboardType="phone-pad" placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} placeholder="WhatsApp" value={formWhatsapp} onChangeText={setFormWhatsapp} keyboardType="phone-pad" placeholderTextColor={COLORS.textLight} />
                <TextInput style={[styles.input, { height: 80 }]} placeholder="Description" value={formDesc} onChangeText={setFormDesc} multiline placeholderTextColor={COLORS.textLight} />

                <Text style={styles.formSection}>🔑 Owner Login Credentials</Text>
                <TextInput style={styles.input} placeholder="Email (for login) *" value={formEmail} onChangeText={setFormEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} placeholder="Password *" value={formPassword} onChangeText={setFormPassword} secureTextEntry placeholderTextColor={COLORS.textLight} />

                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  <Text style={{ fontSize: 24 }}>{formImage ? '✅' : '📷'}</Text>
                  <Text style={styles.imagePickerText}>{formImage ? 'Image Selected' : 'Add Brand Logo'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.5 }]}
                  onPress={handleAddBrand}
                  disabled={submitting}
                >
                  {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>Create Brand</Text>}
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Owner Login Modal */}
      <Modal visible={showOwnerLoginModal} animationType="slide" transparent onRequestClose={() => setShowOwnerLoginModal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={[styles.modalContent, { maxHeight: '70%' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.detailName}>🔑 Brand Owner Login</Text>
                <TouchableOpacity onPress={() => setShowOwnerLoginModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 18 }}>
                {t('ownerLoginSubtitle')}
              </Text>
              <TextInput
                style={styles.input} placeholder="Email address" value={ownerEmail}
                onChangeText={setOwnerEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textLight}
              />
              <TextInput
                style={styles.input} placeholder="Password" value={ownerPassword}
                onChangeText={setOwnerPassword} secureTextEntry placeholderTextColor={COLORS.textLight}
              />
              <TouchableOpacity
                style={[styles.submitBtn, ownerLoginLoading && { opacity: 0.5 }]}
                onPress={handleOwnerLogin} disabled={ownerLoginLoading}
              >
                {ownerLoginLoading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.submitBtnText}>{t('loginAsBrandOwner')}</Text>
                }
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Add Deal Modal (Owner) */}
      <Modal visible={showAddDeal} animationType="slide" transparent onRequestClose={() => setShowAddDeal(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={[styles.modalContent, { maxHeight: '90%' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.detailName}>Add New Deal</Text>
                <TouchableOpacity onPress={() => setShowAddDeal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <TextInput style={styles.input} placeholder={t('dealTitle')} value={dealTitle} onChangeText={setDealTitle} placeholderTextColor={COLORS.textLight} />
                <TextInput style={[styles.input, { height: 80 }]} placeholder="Description (optional)" value={dealDesc} onChangeText={setDealDesc} multiline placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} placeholder="Price (e.g. Rs. 500 or 30% OFF)" value={dealPrice} onChangeText={setDealPrice} placeholderTextColor={COLORS.textLight} />
                <TextInput style={styles.input} placeholder="Original Price (e.g. Rs. 800)" value={dealOriginalPrice} onChangeText={setDealOriginalPrice} placeholderTextColor={COLORS.textLight} />

                <TouchableOpacity style={styles.imagePicker} onPress={pickDealMedia}>
                  <Text style={{ fontSize: 24 }}>{dealMedia.length > 0 ? '✅' : '📷'}</Text>
                  <Text style={styles.imagePickerText}>
                    {dealMedia.length > 0 ? `${dealMedia.length} file(s) selected` : 'Add Images / Video (max 6, 30MB)'}
                  </Text>
                </TouchableOpacity>
                {dealMedia.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                    {dealMedia.map((asset, i) => (
                      <View key={i} style={{ marginRight: 8, position: 'relative' }}>
                        <Image source={{ uri: asset.uri }} style={{ width: 70, height: 70, borderRadius: 8 }} />
                        {asset.type === 'video' && (
                          <View style={{ position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: 2 }}>
                            <Ionicons name="videocam" size={12} color="#FFF" />
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={[styles.submitBtn, dealSubmitting && { opacity: 0.5 }]}
                  onPress={handleAddDeal} disabled={dealSubmitting}
                >
                  {dealSubmitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitBtnText}>{t('addDealBtn')}</Text>}
                </TouchableOpacity>
                {dealSubmitting && (
                  <Text style={{ textAlign: 'center', color: COLORS.textLight, fontSize: 12, marginTop: 8 }}>
                    Uploading media... This may take a minute for videos.
                  </Text>
                )}
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 52 : 24,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleNew: { fontSize: 19, fontWeight: '800', color: '#FFF' },
  tabsWrapNew: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsScrollNew: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tabNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  tabNewActive: { borderColor: COLORS.primary, backgroundColor: (COLORS.primary + '15') },
  tabNewText: { fontSize: 13, fontWeight: '800', color: '#6B7280' },
  tabNewTextActive: { color: COLORS.primary },
  tabBadgeNew: {
    backgroundColor: '#EF4444',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 2,
  },
  tabBadgeNewText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.primary, paddingTop: 48, paddingBottom: 14, paddingHorizontal: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
  tabsRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.secondary },
  tabText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.secondary },
  // Modern deal card
  dealCardNew: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  dealMediaNew: { height: 200, backgroundColor: '#E5E7EB' },
  dealImageNew: { width: '100%', height: '100%' },
  dealImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  dealGradientTop: { position: 'absolute', top: 0, left: 0, right: 0, height: 70 },
  playOverlayBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -26,
    marginTop: -26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveOverlayBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealBodyNew: { padding: 16 },
  dealHeaderRowNew: { flexDirection: 'row', alignItems: 'flex-start' },
  dealTitleNew: { fontSize: 18, fontWeight: '900', color: '#111827', lineHeight: 22 },
  dealDescNew: { fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  currentPriceNew: { fontSize: 22, fontWeight: '900', color: '#059669' },
  originalPriceNew: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through', marginTop: 2 },
  statsRowNew: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statItemNew: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statTextNew: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  dealFooterNew: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 10 },
  brandRowNew: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandAvatarNew: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E5E7EB' },
  brandAvatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: (COLORS.primary + '20'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandAvatarLetter: { fontSize: 15, fontWeight: '900', color: COLORS.primary },
  brandNameNew: { fontSize: 14, fontWeight: '900', color: '#111827' },
  brandAddrNew: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  dealActionsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  callChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  callChipText: { color: '#FFF', fontSize: 12, fontWeight: '900' },
  // Toast
  toastContainer: { position: 'absolute', left: 0, right: 0, bottom: 90, alignItems: 'center', zIndex: 9999 },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    maxWidth: '92%',
  },
  toastText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  // Skeleton
  skeletonCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  skeletonImage: { height: 200, backgroundColor: '#E5E7EB' },
  skeletonContent: { padding: 16 },
  skeletonLine: { height: 14, backgroundColor: '#E5E7EB', borderRadius: 6, marginBottom: 10, width: '80%' },
  skeletonFooter: { height: 38, backgroundColor: '#E5E7EB', borderRadius: 10, marginTop: 10 },
  videoBadge: {
    position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  videoBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  dealInfo: { padding: 14 },
  dealTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  dealDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  originalPrice: { fontSize: 13, color: COLORS.textLight, textDecorationLine: 'line-through' },
  dealPrice: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  brandTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  miniLogo: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.border },
  brandName: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  expiresText: { fontSize: 11, color: '#F59E0B', marginTop: 4 },
  dealPhoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  dealPhoneText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  // Brand card
  brandCard: {
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 12,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  brandHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  brandImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.border },
  brandPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  brandCardName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  brandAddress: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  brandDeals: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  contactText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  // Admin
  adminActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  adminBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, marginBottom: 16,
  },
  addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  adminCard: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  adminCardName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  adminCardSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '85%',
  },
  modalClose: { position: 'absolute', top: 16, right: 16, zIndex: 10 },
  detailImage: { width: '100%', height: 180, borderRadius: 14, marginBottom: 14, backgroundColor: COLORS.border },
  detailName: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  detailAddr: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  detailDesc: { fontSize: 14, color: COLORS.text, lineHeight: 20, marginBottom: 12 },
  dealsHeader: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 10 },
  detailDeal: {
    backgroundColor: COLORS.background, borderRadius: 12, padding: 12, marginBottom: 10,
  },
  detailDealImage: { width: '100%', height: 120, borderRadius: 10, marginBottom: 8, backgroundColor: COLORS.border },
  detailDealTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  detailDealDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  // Form
  input: {
    backgroundColor: COLORS.background, borderRadius: 10, padding: 14, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 10, color: COLORS.text,
  },
  formSection: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 8, marginBottom: 8 },
  imagePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 16, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed',
    borderColor: COLORS.border, marginBottom: 14, justifyContent: 'center',
  },
  imagePickerText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  submitBtn: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center',
  },
  submitBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  // Empty
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary, fontWeight: '600' },
  emptySubText: { fontSize: 13, color: COLORS.textLight, marginTop: 4, textAlign: 'center' },

  // Image viewer
  viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.96)' },
  viewerTopBar: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewerCounter: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  viewerCloseBtn: { padding: 6 },
  viewerPage: { width, flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewerImage: { width, height: '80%' },
  viewerVideo: { width, height: '80%', backgroundColor: '#000' },

  viewsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  viewsText: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '700' },
  playVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
  },
  playVideoText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
