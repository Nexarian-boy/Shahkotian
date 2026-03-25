import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { acAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdBanner from '../components/AdBanner';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ACOfficeScreen({ navigation }) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await acAPI.getComplainantStatus();
      setStatus(res.data.status);
    } catch (e) {
      setStatus('NOT_SUBMITTED');
    } finally {
      setLoading(false);
    }
  };

  const handleComplaintBox = () => {
    if (loading) return;
    if (status === 'APPROVED') {
      navigation.navigate('ACComplaint');
    } else if (status === 'PENDING') {
      navigation.navigate('ACCNICUpload', { pendingMode: true });
    } else {
      navigation.navigate('ACCNICUpload');
    }
  };

  return (
    <LinearGradient colors={[COLORS.backgroundGradientTop, COLORS.backgroundGradientBottom]} style={{ flex: 1 }}>
      {/* Header */}
      <LinearGradient colors={['#1E40AF', '#3B82F6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AC Office Portal</Text>
          <Text style={styles.headerSubtitle}>Assistant Commissioner Office Services</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="business" size={28} color="rgba(255,255,255,0.6)" />
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 40) }]}>
        {/* Announcements Card */}
        <TouchableOpacity
          style={[styles.optionCard, { borderColor: '#3B82F620' }]}
          onPress={() => navigation.navigate('ACAnnouncements')}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#3B82F612' }]}>
            <Ionicons name="megaphone" size={28} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>Announcements</Text>
            <Text style={styles.optionSub}>Latest updates from AC Office</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Complaint Box Card */}
        <TouchableOpacity
          style={[styles.optionCard, { borderColor: '#EF444420' }]}
          onPress={handleComplaintBox}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#EF444412' }]}>
            <Ionicons name="alert-circle" size={28} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>Complaint Box</Text>
            <Text style={styles.optionSub}>
              {loading ? 'Checking status...' :
                status === 'APPROVED' ? 'Submit your complaint' :
                status === 'PENDING' ? '⏳ CNIC verification pending' :
                status === 'REJECTED' ? '❌ CNIC rejected - contact admin' :
                'Identity verification required'}
            </Text>
          </View>
          {loading ? <ActivityIndicator size="small" color={COLORS.primary} /> :
            <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />}
        </TouchableOpacity>

        {/* My Complaints History */}
        {status === 'APPROVED' && (
          <TouchableOpacity
            style={[styles.optionCard, { borderColor: '#8B5CF620' }]}
            onPress={() => navigation.navigate('ACComplaintHistory')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, { backgroundColor: '#8B5CF612' }]}>
              <Ionicons name="document-text" size={28} color="#8B5CF6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionTitle}>My Complaints</Text>
              <Text style={styles.optionSub}>View history & track status</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {/* AC Officer Login */}
        <TouchableOpacity
          style={[styles.optionCard, { borderColor: '#1E40AF20' }]}
          onPress={() => navigation.navigate('ACLogin')}
          activeOpacity={0.7}
        >
          <View style={[styles.optionIcon, { backgroundColor: '#1E40AF12' }]}> 
            <Ionicons name="shield-checkmark" size={28} color="#1E40AF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionTitle}>AC Officer Login</Text>
            <Text style={styles.optionSub}>For authorized AC staff dashboard access</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={COLORS.textLight} />
        </TouchableOpacity>

        <AdBanner />

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#1E40AF" />
          <Text style={styles.infoText}>
            Your identity (CNIC) is verified once and stored securely. All complaints are tracked with your verified identity for accountability.
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 16,
    padding: 18, marginBottom: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6,
  },
  optionIcon: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  optionSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginTop: 8,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoText: { fontSize: 12, color: '#1E40AF', marginLeft: 10, flex: 1, lineHeight: 18 },
});
