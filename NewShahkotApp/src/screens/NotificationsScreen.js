import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../config/constants';
import { notificationsAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import AdBanner from '../components/AdBanner';

export default function NotificationsScreen() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const localReadIds = useRef(new Set());
  const didFocusOnce = useRef(false);

  const mergeWithLocalReads = (serverNotifications) => {
    return serverNotifications.map((n) => (
      localReadIds.current.has(n.id) ? { ...n, isRead: true } : n
    ));
  };

  const fetchNotifications = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      const serverData = res.data.notifications || [];
      setNotifications(mergeWithLocalReads(serverData));
    } catch (err) {
      console.log('Failed to load notifications:', err?.response?.data || err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const showLoader = !didFocusOnce.current;
      didFocusOnce.current = true;
      fetchNotifications(showLoader);
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(false);
  }, []);

  const markAsRead = async (id) => {
    localReadIds.current.add(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await notificationsAPI.markRead(id);
    } catch (err) {
      console.warn('markRead API failed for id', id, ':', err?.response?.data || err?.message);
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => {
      prev.forEach((n) => localReadIds.current.add(n.id));
      return prev.map((n) => ({ ...n, isRead: true }));
    });

    try {
      await notificationsAPI.markAllRead();
    } catch (err) {
      console.warn('markAllRead API failed:', err?.response?.data || err?.message);
      Alert.alert('Error', 'Could not mark all as read. Please try again.');
      localReadIds.current.clear();
      fetchNotifications(false);
    }
  };

  const getIcon = (type) => {
    const map = {
      RISHTA_APPROVED: '✅',
      RISHTA_REJECTED: '❌',
      NEWS_PUBLISHED: '📰',
      TOURNAMENT_UPDATE: '🏆',
      GENERAL: '🔔',
    };
    return map[type] || '🔔';
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.isRead && styles.unread]}
      onPress={() => markAsRead(item.id)}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{getIcon(item.type)}</Text>
      <View style={styles.content}>
        <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={3}>{item.body}</Text>
        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t('notificationsTitle')}{notifications.filter(n => !n.isRead).length > 0 ? ` (${notifications.filter(n => !n.isRead).length})` : ''}
        </Text>
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>{t('markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <AdBanner />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyText}>{t('noNotifications')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  markAll: { color: COLORS.white, fontSize: 13, textDecorationLine: 'underline' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  unread: { backgroundColor: COLORS.primary + '10', borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  icon: { fontSize: 24, marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  unreadText: { fontWeight: '800' },
  message: { fontSize: 13, color: COLORS.textLight, marginTop: 3 },
  time: { fontSize: 11, color: COLORS.textLight, marginTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyText: { fontSize: 16, color: COLORS.textLight },
});
