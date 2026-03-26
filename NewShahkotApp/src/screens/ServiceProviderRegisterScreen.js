import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { servicesAPI } from '../services/api';

export default function ServiceProviderRegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState('');
  const [description, setDescription] = useState('');
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await servicesAPI.getCategories();
      setCategories(res.data.categories || []);
    } catch {
      Alert.alert('Error', 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled) return;
    if (type === 'front') setCnicFront(result.assets[0]);
    else setCnicBack(result.assets[0]);
  };

  const submit = async () => {
    if (!selectedCategory || !selectedSubCategory || !phone.trim() || !experience.trim() || !cnicFront || !cnicBack) {
      return Alert.alert('Required', 'Please fill all required fields and upload both CNIC images.');
    }

    const expNum = parseInt(experience, 10);
    if (Number.isNaN(expNum) || expNum < 0 || expNum > 60) {
      return Alert.alert('Invalid', 'Experience must be between 0 and 60 years.');
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('categoryId', selectedCategory.id);
      formData.append('subCategoryId', selectedSubCategory.id);
      formData.append('phone', phone.trim());
      formData.append('experience', String(expNum));
      formData.append('description', description.trim());
      formData.append('cnicFront', {
        uri: cnicFront.uri,
        type: 'image/jpeg',
        name: 'cnic_front.jpg',
      });
      formData.append('cnicBack', {
        uri: cnicBack.uri,
        type: 'image/jpeg',
        name: 'cnic_back.jpg',
      });

      await servicesAPI.registerProvider(formData);
      Alert.alert('Submitted', 'Your request was submitted. Wait for admin approval.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit request.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Register Service Provider</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14 }}>
        <Text style={styles.label}>Category *</Text>
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

        <Text style={styles.label}>Sub-category *</Text>
        <View style={styles.wrapRow}>
          {(selectedCategory?.subCategories || []).map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.subChip, selectedSubCategory?.id === sub.id && styles.subChipActive]}
              onPress={() => setSelectedSubCategory(sub)}
            >
              <Text style={[styles.subText, selectedSubCategory?.id === sub.id && styles.subTextActive]}>{sub.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Phone *</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="03XXXXXXXXX" placeholderTextColor={COLORS.textLight} />

        <Text style={styles.label}>Experience (years) *</Text>
        <TextInput style={styles.input} value={experience} onChangeText={setExperience} keyboardType="numeric" placeholder="e.g. 4" placeholderTextColor={COLORS.textLight} />

        <Text style={styles.label}>Description (optional)</Text>
        <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} multiline placeholder="Short details about your service" placeholderTextColor={COLORS.textLight} />

        <Text style={styles.label}>CNIC Front *</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('front')}>
          {cnicFront ? <Image source={{ uri: cnicFront.uri }} style={styles.preview} /> : <Text style={styles.uploadText}>Tap to upload front image</Text>}
        </TouchableOpacity>

        <Text style={styles.label}>CNIC Back *</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={() => pickImage('back')}>
          {cnicBack ? <Image source={{ uri: cnicBack.uri }} style={styles.preview} /> : <Text style={styles.uploadText}>Tap to upload back image</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.6 }]} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Submit for Approval</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  back: { color: COLORS.white, fontSize: 15 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 6 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6, marginTop: 10, fontWeight: '700' },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 10, color: COLORS.text },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.textSecondary, fontSize: 12 },
  chipTextActive: { color: COLORS.white, fontWeight: '700' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subChip: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  subChipActive: { backgroundColor: '#E3F2FD', borderColor: COLORS.primary },
  subText: { fontSize: 12, color: COLORS.textSecondary },
  subTextActive: { color: COLORS.primary, fontWeight: '700' },
  uploadBox: { height: 120, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  uploadText: { fontSize: 13, color: COLORS.textLight },
  preview: { width: '100%', height: '100%' },
  submitBtn: { marginTop: 20, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
