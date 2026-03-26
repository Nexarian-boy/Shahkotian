import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { servicesAPI } from '../services/api';

export default function ServicesScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [providerStatus, setProviderStatus] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, myRes] = await Promise.allSettled([
        servicesAPI.getCategories(),
        servicesAPI.getMyProviderStatus(),
      ]);

      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data.categories || []);
      }

      if (myRes.status === 'fulfilled') {
        setProviderStatus(myRes.value.data.provider || null);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load services.');
    } finally {
      setLoading(false);
    }
  };

  const openSeekersList = () => {
    if (!selectedSubCategory) {
      Alert.alert('Required', 'Please select category and sub-category first.');
      return;
    }
    navigation.navigate('ServiceProvidersList', {
      categoryId: selectedCategory?.id,
      subCategoryId: selectedSubCategory.id,
      categoryName: selectedCategory?.name,
      subCategoryName: selectedSubCategory.name,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Services</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I want to offer service</Text>
        <TouchableOpacity style={styles.bigBtn} onPress={() => navigation.navigate('ServiceProviderRegister')}>
          <Ionicons name="briefcase" size={20} color={COLORS.white} />
          <Text style={styles.bigBtnText}>Register as Provider</Text>
        </TouchableOpacity>

        {providerStatus && (
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Your Provider Status</Text>
            <Text style={styles.statusLine}>Category: {providerStatus.category?.name || '-'}</Text>
            <Text style={styles.statusLine}>Sub-category: {providerStatus.subCategory?.name || '-'}</Text>
            <Text style={[styles.statusBadge, providerStatus.status === 'APPROVED' ? styles.approved : providerStatus.status === 'REJECTED' ? styles.rejected : styles.pending]}>
              {providerStatus.status}
            </Text>
            {providerStatus.rejectionReason ? (
              <Text style={styles.rejectReason}>Reason: {providerStatus.rejectionReason}</Text>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>I want to hire service</Text>
        <Text style={styles.help}>Select category and sub-category to see available providers.</Text>

        <View style={{ marginBottom: 10, gap: 8 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategory?.id === cat.id && styles.chipActive]}
              onPress={() => {
                setSelectedCategory(cat);
                setSelectedSubCategory(null);
              }}
            >
              <Text style={[styles.chipText, selectedCategory?.id === cat.id && styles.chipTextActive]}>{cat.emoji} {cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {(selectedCategory.subCategories || []).map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[styles.subChip, selectedSubCategory?.id === sub.id && styles.subChipActive]}
                onPress={() => setSelectedSubCategory(sub)}
              >
                <Text style={[styles.subChipText, selectedSubCategory?.id === sub.id && styles.subChipTextActive]}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.bigBtn, { opacity: selectedSubCategory ? 1 : 0.5 }]} onPress={openSeekersList} disabled={!selectedSubCategory}>
          <Ionicons name="search" size={20} color={COLORS.white} />
          <Text style={styles.bigBtnText}>Find Providers</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backText: { color: COLORS.white, fontSize: 15 },
  title: { color: COLORS.white, fontSize: 22, fontWeight: '800' },
  section: { margin: 14, backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  help: { fontSize: 12, color: COLORS.textLight, marginBottom: 10 },
  bigBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  bigBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  statusCard: { marginTop: 10, backgroundColor: COLORS.background, borderRadius: 10, padding: 10 },
  statusTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  statusLine: { fontSize: 12, color: COLORS.textSecondary },
  statusBadge: { marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700' },
  pending: { backgroundColor: '#FFF3E0', color: '#E65100' },
  approved: { backgroundColor: '#E8F5E9', color: '#2E7D32' },
  rejected: { backgroundColor: '#FFEBEE', color: '#C62828' },
  rejectReason: { fontSize: 12, color: '#C62828', marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 12, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },
  subChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  subChipActive: { backgroundColor: '#E3F2FD', borderColor: COLORS.primary },
  subChipText: { fontSize: 12, color: COLORS.textSecondary },
  subChipTextActive: { color: COLORS.primary, fontWeight: '700' },
});
