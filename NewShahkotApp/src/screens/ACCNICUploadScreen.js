import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../config/constants';
import { acAPI } from '../services/api';
import AdBanner from '../components/AdBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ACCNICUploadScreen({ navigation, route }) {
  const isPending = route.params?.pendingMode;
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState('');
  const [cnicNumber, setCnicNumber] = useState('');
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const pickImage = async (side) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      if (side === 'front') setCnicFront(result.assets[0]);
      if (side === 'back') setCnicBack(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!phone.trim()) return Alert.alert('Required', 'Please enter your phone number.');
    if (!cnicFront || !cnicBack) return Alert.alert('Required', 'Both CNIC Front and Back pictures are required.');
    if (!agreed) return Alert.alert('Required', 'You must agree to the disclaimer to continue.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('phone', phone.trim());
      if (cnicNumber) formData.append('cnicNumber', cnicNumber.trim());

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

      await acAPI.submitCnic(formData);
      Alert.alert('Success', 'CNIC uploaded successfully. Please wait for Admin approval.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload CNIC.');
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Ionicons name="time" size={80} color={COLORS.warning} />
        <Text style={[styles.title, { marginTop: 16, textAlign: 'center' }]}>Verification Pending</Text>
        <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 8 }]}>
          Your CNIC and Phone Number have been submitted and are waiting for Admin approval.
        </Text>
        <TouchableOpacity style={[styles.button, { marginTop: 32, width: '100%' }]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Identity Verification</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 40) }]} showsVerticalScrollIndicator={false}>
        {/* Urdu Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="warning" size={24} color="#B45309" style={{ marginBottom: 8 }} />
          <Text style={styles.urduText}>
            کوئی بھی غلط یا بلا وجہ کی شکایت نہ کریں، اپنا اور ادارے کا وقت ضائع نہ کریں۔ شکریہ
          </Text>
          <Text style={styles.engText}>
            Do not make false or unreasonable complaints. Do not waste your and the department's time. Thank you.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="03XXXXXXXXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CNIC Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="XXXXX-XXXXXXX-X"
            keyboardType="number-pad"
            value={cnicNumber}
            onChangeText={setCnicNumber}
          />
        </View>

        <Text style={styles.sectionTitle}>CNIC Photos *</Text>
        
        <View style={styles.imagePickersRow}>
          <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage('front')}>
            {cnicFront ? (
              <Image source={{ uri: cnicFront.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerContent}>
                <Ionicons name="camera" size={32} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Front Side</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage('back')}>
            {cnicBack ? (
              <Image source={{ uri: cnicBack.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerContent}>
                <Ionicons name="camera" size={32} color={COLORS.primary} />
                <Text style={styles.imagePickerText}>Back Side</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Checkbox */}
        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxText}>
            I confirm that the provided information is real and I agree to the terms mentioned above.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit for Verification</Text>}
        </TouchableOpacity>
        
        <AdBanner />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border 
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  scrollContent: { padding: 16, paddingBottom: 40 },
  disclaimerBox: {
    backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FDE68A',
    marginBottom: 24, alignItems: 'center'
  },
  urduText: { fontSize: 18, fontWeight: 'bold', color: '#92400E', textAlign: 'center', marginBottom: 8 },
  engText: { fontSize: 12, color: '#B45309', textAlign: 'center', fontStyle: 'italic' },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 14, fontSize: 15, color: COLORS.text
  },
  imagePickersRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  imagePicker: {
    flex: 1, height: 120, backgroundColor: COLORS.primaryLight + '15',
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed',
    overflow: 'hidden'
  },
  imagePickerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imagePickerText: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginTop: 8 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.primary,
    marginRight: 10, marginTop: 2, justifyContent: 'center', alignItems: 'center'
  },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkboxText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },
  button: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
