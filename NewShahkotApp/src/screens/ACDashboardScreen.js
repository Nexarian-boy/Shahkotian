import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { acAPI } from '../services/api';
import { COLORS } from '../config/constants';
import { useAuth } from '../context/AuthContext';

export default function ACDashboardScreen({ navigation, route }) {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState(null);
  const [officer, setOfficer] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ new: 0, working: 0, solved: 0, avgRating: 0.0 });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const logoutTo = route?.params?.logoutTo;

  useEffect(() => {
    loadAuth();
  }, []);

  const loadAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('acToken');
      const storedProfile = await AsyncStorage.getItem('acProfile');
      if (!storedToken || !storedProfile) {
        navigation.replace('ACLogin');
        return;
      }
      setToken(storedToken);
      setOfficer(JSON.parse(storedProfile));
      fetchDashboard(storedToken);
    } catch (e) {
      console.error(e);
      navigation.replace('ACLogin');
    }
  };

  const fetchDashboard = async (acToken = token) => {
    if (!acToken) return;
    try {
      const res = await acAPI.getDashboard(acToken);
      setComplaints(res.data.complaints);
      setStats(res.data.stats);
      setRatings(res.data.ratings);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 401 || e.response?.status === 403) {
        handleLogout();
      } else {
        Alert.alert('Error', 'Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboard();
  }, [token]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('acToken');
    await AsyncStorage.removeItem('acProfile');
    if (logoutTo === 'Login') {
      navigation.replace('Login');
      return;
    }
    if (logoutTo === 'MainTabs') {
      navigation.replace('MainTabs');
      return;
    }
    navigation.replace(isAuthenticated ? 'MainTabs' : 'Login');
  };

  const handleExport = async () => {
    if (!token) return;
    try {
      const url = acAPI.getExportUrl(token);
      Alert.alert(
        'Download Report',
        'You will be redirected to browser to download the Excel report.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: () => Linking.openURL(url) }
        ]
      );
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return { bg: '#E0F2FE', text: '#0284C7' };
      case 'WORKING': return { bg: '#FEF08A', text: '#A16207' };
      case 'SOLVED': return { bg: '#DCFCE7', text: '#15803D' };
      default: return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const filteredComplaints = complaints.filter(c => filter === 'ALL' ? true : c.status === filter);

  const renderComplaint = ({ item }) => {
    const sColors = getStatusColor(item.status);
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => navigation.navigate('ACComplaintDetail', { id: item.id, token })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardComplainant} numberOfLines={1}>{item.complainant?.user?.name || 'Complainant'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sColors.bg }]}>
            <Text style={[styles.statusText, { color: sColors.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.cardDate}>{new Date(item.createdAt).toLocaleDateString('en-PK')} {new Date(item.createdAt).toLocaleTimeString('en-PK', {hour: '2-digit', minute:'2-digit'})}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Welcome, {officer?.name}</Text>
          <Text style={styles.desigText}>{officer?.designation}</Text>
        </View>
        <TouchableOpacity style={[styles.actionBtn, { marginRight: 10 }]} onPress={() => navigation.navigate('ACCreateAnnouncement', { token })}>
          <Ionicons name="megaphone-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
          <Ionicons name="download-outline" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { marginLeft: 10, backgroundColor: 'rgba(239,68,68,0.2)' }]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FECACA" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD' }]}>
          <Text style={[styles.statNum, { color: '#0284C7' }]}>{stats.new}</Text>
          <Text style={styles.statLabel}>New</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#FEF9C3', borderColor: '#FEF08A' }]}>
          <Text style={[styles.statNum, { color: '#A16207' }]}>{stats.working}</Text>
          <Text style={styles.statLabel}>Working</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <Text style={[styles.statNum, { color: '#15803D' }]}>{stats.solved}</Text>
          <Text style={styles.statLabel}>Solved</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
          <Text style={[styles.statNum, { color: '#C2410C', fontSize: 18 }]}>⭐ {stats.avgRating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {['ALL', 'NEW', 'WORKING', 'SOLVED'].map(f => (
          <TouchableOpacity 
            key={f} 
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]} 
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTxt, filter === f && styles.filterTxtActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.createRow}>
        <TouchableOpacity style={[styles.createBtn, styles.createBtnPrimary]} onPress={() => navigation.navigate('ACCreateAnnouncement', { token })}>
          <Ionicons name="megaphone-outline" size={18} color="#fff" />
          <Text style={styles.createBtnText}>Create Announcement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.createBtn, styles.createBtnSecondary]} onPress={() => navigation.navigate('ACAnnouncements')}>
          <Ionicons name="list-outline" size={18} color="#fff" />
          <Text style={styles.createBtnText}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Complaints List */}
      <FlatList
        data={filteredComplaints}
        keyExtractor={item => item.id}
        renderItem={renderComplaint}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No complaints found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#1E3A8A', paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24
  },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  desigText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 10, marginTop: -10 },
  statBox: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  statNum: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  filterTxt: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  filterTxtActive: { color: '#fff' },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  createBtn: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  createBtnPrimary: { marginRight: 6 },
  createBtnSecondary: { backgroundColor: '#334155', marginLeft: 6 },
  createBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardComplainant: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardTitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: 8, lineHeight: 20 },
  cardDate: { fontSize: 12, color: COLORS.textLight },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40, fontSize: 15 }
});
