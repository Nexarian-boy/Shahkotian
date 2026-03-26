import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { servicesAPI } from '../services/api';

function Stars({ value = 0 }) {
  const rounded = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons key={n} name={n <= rounded ? 'star' : 'star-outline'} size={12} color="#F59E0B" />
      ))}
    </View>
  );
}

export default function ServiceProvidersListScreen({ navigation, route }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedSubCategory?.id) {
      loadProviders(selectedSubCategory.id, selectedCategory?.id);
    }
  }, [selectedSubCategory?.id]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await servicesAPI.getCategories();
      const cats = res.data.categories || [];
      setCategories(cats);

      const routeCatId = route.params?.categoryId;
      const routeSubId = route.params?.subCategoryId;
      if (routeCatId) {
        const cat = cats.find((c) => c.id === routeCatId);
        if (cat) {
          setSelectedCategory(cat);
          if (routeSubId) {
            const sub = (cat.subCategories || []).find((s) => s.id === routeSubId);
            if (sub) setSelectedSubCategory(sub);
          }
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async (subCategoryId, categoryId) => {
    setLoading(true);
    try {
      const res = await servicesAPI.getProviders(subCategoryId, categoryId);
      setProviders(res.data.providers || []);
    } catch {
      Alert.alert('Error', 'Failed to load providers.');
    } finally {
      setLoading(false);
    }
  };

  const renderProvider = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ServiceProviderDetail', { providerId: item.id })}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.user?.photoUrl ? (
          <Image source={{ uri: item.user.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}><Text style={{ color: COLORS.primary, fontWeight: '700' }}>{(item.user?.name || 'U').slice(0, 1)}</Text></View>
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.name}>{item.user?.name || 'Provider'}</Text>
          <Text style={styles.sub}>{item.category?.name} → {item.subCategory?.name}</Text>
          <Text style={styles.sub}>Experience: {item.experience} years</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Stars value={item.avgStars || 0} />
            <Text style={styles.ratingText}>{item.avgStars || 0} ({item.reviewsCount || 0})</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Available Service Providers</Text>
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory?.id === cat.id && styles.chipActive]}
              onPress={() => {
                setSelectedCategory(cat);
                setSelectedSubCategory(null);
                setProviders([]);
              }}
            >
              <Text style={[styles.chipText, selectedCategory?.id === cat.id && styles.chipTextActive]}>{cat.emoji} {cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedCategory && (
          <View style={styles.subWrap}>
            {(selectedCategory.subCategories || []).map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[styles.subChip, selectedSubCategory?.id === sub.id && styles.subChipActive]}
                onPress={() => setSelectedSubCategory(sub)}
              >
                <Text style={[styles.subText, selectedSubCategory?.id === sub.id && styles.subTextActive]}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14 }}
          renderItem={renderProvider}
          ListEmptyComponent={<View style={styles.center}><Text style={{ color: COLORS.textLight }}>No providers found for selected sub-category.</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  back: { color: COLORS.white, fontSize: 15 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 6 },
  filters: { backgroundColor: COLORS.surface, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },
  subWrap: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  subChipActive: { backgroundColor: '#E3F2FD', borderColor: COLORS.primary },
  subText: { fontSize: 12, color: COLORS.textSecondary },
  subTextActive: { color: COLORS.primary, fontWeight: '700' },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  ratingText: { fontSize: 11, color: COLORS.textLight },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
});
