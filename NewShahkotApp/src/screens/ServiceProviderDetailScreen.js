import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Linking, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { servicesAPI, dmAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Stars({ value = 0, size = 14 }) {
  const rounded = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= rounded ? 'star' : 'star-outline'} size={size} color="#F59E0B" />
      ))}
    </View>
  );
}

export default function ServiceProviderDetailScreen({ navigation, route }) {
  const { user } = useAuth();
  const providerId = route.params?.providerId;

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    loadProvider();
  }, [providerId]);

  const loadProvider = async () => {
    if (!providerId) return;
    setLoading(true);
    try {
      const res = await servicesAPI.getProviderDetail(providerId);
      setProvider(res.data.provider || null);
    } catch {
      Alert.alert('Error', 'Failed to load provider detail.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = async () => {
    if (!provider?.user?.phone) {
      Alert.alert('Unavailable', 'Phone number is not available.');
      return;
    }
    const url = `tel:${provider.user.phone}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Error', 'Calling is not supported on this device.');
      return;
    }
    await Linking.openURL(url);
  };

  const handleMessage = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to send a message.');
      return;
    }
    try {
      const res = await dmAPI.startOrGetChatWithUser(provider.user.id);
      navigation.navigate('DMChat', {
        chatId: res.data.chatId,
        name: provider.user.name || 'Service Provider',
      });
    } catch {
      Alert.alert('Error', 'Failed to open chat.');
    }
  };

  const goReview = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to submit review.');
      return;
    }
    navigation.navigate('ServiceReview', { providerId: provider.id, providerName: provider.user?.name || 'Provider' });
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  if (!provider) {
    return (
      <View style={styles.center}>
        <Text style={{ color: COLORS.textLight }}>Provider not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{provider.user?.name || 'Service Provider'}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detail}>Category: {provider.category?.name}</Text>
          <Text style={styles.detail}>Sub-category: {provider.subCategory?.name}</Text>
          <Text style={styles.detail}>Experience: {provider.experience} years</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <Stars value={provider.avgStars || 0} size={16} />
            <Text style={styles.smallText}>{provider.avgStars || 0} / 5 ({provider.reviewsCount || 0} reviews)</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, styles.callBtn]} onPress={handleCall}>
            <Ionicons name="call-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.msgBtn]} onPress={handleMessage}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.reviewBtn]} onPress={goReview}>
            <Ionicons name="star-outline" size={16} color={COLORS.white} />
            <Text style={styles.actionText}>Review</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          <FlatList
            data={provider.reviews || []}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.smallText}>No reviews yet.</Text>}
            renderItem={({ item }) => (
              <View style={styles.reviewCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.reviewName}>{item.seeker?.name || 'User'}</Text>
                  <Stars value={item.stars} />
                </View>
                {item.comment ? <Text style={styles.reviewText}>{item.comment}</Text> : null}
              </View>
            )}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  back: { color: COLORS.white, fontSize: 15 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 6 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 14, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  detail: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  smallText: { fontSize: 12, color: COLORS.textLight },
  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  callBtn: { backgroundColor: '#059669' },
  msgBtn: { backgroundColor: COLORS.primary },
  reviewBtn: { backgroundColor: '#7C3AED' },
  actionText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  reviewCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 10, marginTop: 8, backgroundColor: '#FAFAFA' },
  reviewName: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  reviewText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
});
