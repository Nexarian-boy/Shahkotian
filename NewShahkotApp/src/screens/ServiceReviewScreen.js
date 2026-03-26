import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { servicesAPI } from '../services/api';

export default function ServiceReviewScreen({ navigation, route }) {
  const providerId = route.params?.providerId;
  const providerName = route.params?.providerName || 'Provider';

  const [stars, setStars] = useState(5);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReview = async () => {
    if (!providerId) {
      Alert.alert('Error', 'Provider missing.');
      return;
    }
    if (stars < 1 || stars > 5) {
      Alert.alert('Error', 'Please select rating between 1 and 5.');
      return;
    }

    setSubmitting(true);
    try {
      await servicesAPI.submitReview(providerId, stars, review.trim());
      Alert.alert('Success', 'Your review has been submitted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      const msg = error?.response?.data?.error || 'Failed to submit review.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={20} color={COLORS.white} />
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review {providerName}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>How was your experience?</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity key={n} onPress={() => setStars(n)}>
              <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={34} color="#F59E0B" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Review (Optional)</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={5}
          value={review}
          onChangeText={setReview}
          placeholder="Share details about communication, quality, time, etc..."
          placeholderTextColor={COLORS.textLight}
          textAlignVertical="top"
          maxLength={600}
        />
        <Text style={styles.counter}>{review.length}/600</Text>

        <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={submitReview} disabled={submitting}>
          {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.submitText}>Submit Review</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16 },
  back: { color: COLORS.white, fontSize: 15 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: '800', marginTop: 6 },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 8, marginTop: 8 },
  starsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  input: { backgroundColor: COLORS.surface, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, minHeight: 110, padding: 12, color: COLORS.text },
  counter: { marginTop: 6, color: COLORS.textLight, fontSize: 11, textAlign: 'right' },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  submitText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
});
