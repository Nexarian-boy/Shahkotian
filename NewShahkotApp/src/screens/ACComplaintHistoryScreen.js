import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Image, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { acAPI } from '../services/api';
import AdBanner from '../components/AdBanner';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ACComplaintHistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, working: 0, solved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rating Modal State
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await acAPI.getMyComplaints();
      setComplaints(res.data.complaints);
      setStats(res.data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const openRatingModal = (id) => {
    setSelectedComplaintId(id);
    setRatingValue(0);
    setRatingModalVisible(true);
  };

  const submitRating = async () => {
    if (ratingValue === 0) return;
    setSubmittingRating(true);
    try {
      await acAPI.rateComplaint(selectedComplaintId, ratingValue);
      setRatingModalVisible(false);
      fetchData(); // Refresh list to show rating
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return { bg: '#E0F2FE', text: '#0284C7', label: 'New' };
      case 'WORKING': return { bg: '#FEF08A', text: '#A16207', label: 'AC is Working' };
      case 'SOLVED': return { bg: '#DCFCE7', text: '#15803D', label: 'Resolved' };
      default: return { bg: '#F1F5F9', text: '#64748B', label: status };
    }
  };

  const renderItem = ({ item }) => {
    const sColors = getStatusColor(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sColors.bg }]}>
            <Text style={[styles.statusText, { color: sColors.text }]}>{sColors.label}</Text>
          </View>
        </View>
        
        <Text style={styles.dateText}>
          Submitted: {new Date(item.createdAt).toLocaleDateString('en-PK')}
        </Text>
        
        {item.resolvedAt && (
          <Text style={styles.dateText}>
            Resolved: {new Date(item.resolvedAt).toLocaleDateString('en-PK')}
          </Text>
        )}

        {item.status === 'SOLVED' && (
          <View style={styles.ratingSection}>
            {item.rating ? (
              <View style={styles.starsRow}>
                <Text style={styles.ratingLabel}>Your Rating: </Text>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name={i < item.rating ? "star" : "star-outline"} size={16} color="#F59E0B" />
                ))}
              </View>
            ) : (
              <TouchableOpacity style={styles.rateBtn} onPress={() => openRatingModal(item.id)}>
                <Ionicons name="star" size={16} color="#fff" />
                <Text style={styles.rateBtnText}>Rate AC Officer's Work</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Complaints</Text>
      </View>

      {!loading && (
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: '#F1F5F9' }]}>
            <Text style={styles.statNum}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#E0F2FE' }]}>
            <Text style={[styles.statNum, { color: '#0284C7' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>New</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#FEF9C3' }]}>
            <Text style={[styles.statNum, { color: '#CA8A04' }]}>{stats.working}</Text>
            <Text style={styles.statLabel}>Working</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statNum, { color: '#15803D' }]}>{stats.solved}</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="folder-open-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No complaints submitted yet.</Text>
            </View>
          }
        />
      )}

      {/* AdBanner at bottom */}
      <View style={{ backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border, paddingBottom: Math.max(insets.bottom, 10) }}>
        <AdBanner />
      </View>

      {/* RATING MODAL */}
      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate Resolution</Text>
            <Text style={styles.modalSub}>How satisfied are you with the AC Officer's resolution of your complaint?</Text>
            
            <View style={styles.modalStarsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRatingValue(star)}>
                  <Ionicons name={star <= ratingValue ? "star" : "star-outline"} size={40} color="#F59E0B" style={{ marginHorizontal: 4 }} />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.modalSubmitBtn, (ratingValue === 0 || submittingRating) && { opacity: 0.6 }]} 
              onPress={submitRating}
              disabled={ratingValue === 0 || submittingRating}
            >
              {submittingRating ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitTxt}>Submit Rating</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRatingModalVisible(false)} disabled={submittingRating}>
              <Text style={styles.modalCancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  statsRow: { flexDirection: 'row', padding: 16, gap: 10 },
  statBox: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text, marginRight: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  ratingSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  ratingLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginRight: 8 },
  rateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F59E0B', paddingVertical: 8, borderRadius: 8 },
  rateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textSecondary, marginTop: 16, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.surface, width: '100%', borderRadius: 16, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  modalSub: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  modalStarsRow: { flexDirection: 'row', marginBottom: 32 },
  modalSubmitBtn: { backgroundColor: '#F59E0B', width: '100%', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  modalSubmitTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  modalCancelBtn: { padding: 14 },
  modalCancelTxt: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' }
});
