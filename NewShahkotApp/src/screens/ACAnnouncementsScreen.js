import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl, Image, Linking, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, Video, ResizeMode } from 'expo-av';
import { COLORS } from '../config/constants';
import { acAPI } from '../services/api';
import AdBanner from '../components/AdBanner';
import ImageViewer from '../components/ImageViewer';
import { useAuth } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ACAnnouncementsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [acToken, setAcToken] = useState(null);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const soundRef = useRef(null);
  const viewedIdsRef = useRef(new Set());

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const stopVoice = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
    }
    setPlayingVoiceId(null);
  }, []);

  const playVoice = useCallback(async (id, uri) => {
    try {
      await stopVoice();
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.didJustFinish) {
            stopVoice();
          }
        }
      );
      soundRef.current = sound;
      setPlayingVoiceId(id);
    } catch (_) {
      Alert.alert('Error', 'Failed to play voice note.');
      setPlayingVoiceId(null);
    }
  }, [stopVoice]);

  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  useEffect(() => {
    loadAcToken();
    fetchData();
  }, []);

  const loadAcToken = async () => {
    try {
      const token = await AsyncStorage.getItem('acToken');
      setAcToken(token);
    } catch (_) {
      setAcToken(null);
    }
  };

  const fetchData = async () => {
    try {
      const res = await acAPI.getAnnouncements();
      setAnnouncements(res.data.announcements);
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

  const markViewed = useCallback(async (item) => {
    if (!item?.id || viewedIdsRef.current.has(item.id)) return;
    viewedIdsRef.current.add(item.id);

    setAnnouncements((prev) => prev.map((a) => (
      a.id === item.id ? { ...a, views: (a.views || 0) + 1 } : a
    )));

    try {
      await acAPI.viewAnnouncement(item.id);
    } catch (_) {}
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    viewableItems.forEach(({ item }) => {
      markViewed(item);
    });
  }).current;

  const toggleLike = async (id) => {
    if (!user?.id) return;

    const current = announcements.find(a => a.id === id);
    if (!current) return;

    const hasLiked = (current.likedBy || []).includes(user.id);
    const nextLikedBy = hasLiked
      ? (current.likedBy || []).filter(uid => uid !== user.id)
      : [...(current.likedBy || []), user.id];

    setAnnouncements(prev => prev.map(a => (
      a.id === id ? { ...a, likedBy: nextLikedBy, likes: nextLikedBy.length } : a
    )));

    try {
      const res = await acAPI.likeAnnouncement(id);
      setAnnouncements(prev => prev.map(a => {
        if (a.id !== id) return a;
        const serverHasLiked = !!res.data.hasLiked;
        const likedBy = serverHasLiked
          ? Array.from(new Set([...(a.likedBy || []), user.id]))
          : (a.likedBy || []).filter(uid => uid !== user.id);
        return { ...a, likes: res.data.likes, likedBy };
      }));
    } catch (_) {
      setAnnouncements(prev => prev.map(a => (a.id === current.id ? current : a)));
    }
  };

  const openViewer = (images, index) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const openVideo = (url) => {
    if (!url) {
      Alert.alert('Error', 'Video link is missing.');
      return;
    }
    const hasScheme = /^https?:\/\//i.test(url);
    const webUrl = hasScheme ? url : `https://${url}`;
    setActiveVideoUrl(webUrl);
    setVideoModalVisible(true);
  };

  const openVideoInBrowser = async () => {
    if (!activeVideoUrl) return;
    try {
      await Linking.openURL(activeVideoUrl);
    } catch (_) {
      Alert.alert('Error', 'Cannot open this video link.');
    }
  };

  const closeVideoModal = () => {
    setVideoModalVisible(false);
    setActiveVideoUrl(null);
  };

  const handleDeleteAnnouncement = (id, title) => {
    if (!acToken) return;
    Alert.alert('Delete Announcement', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await acAPI.acDeleteAnnouncement(acToken, id);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
            Alert.alert('Deleted', 'Announcement removed.');
          } catch (error) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to delete announcement.');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => {
    const hasLiked = (item.likedBy || []).includes(user?.id);
    const images = item.images || [];
    const videos = item.videos || [];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color="#1E40AF" />
            </View>
            <View>
              <Text style={styles.authorName}>{item.officer?.name || 'Admin'}</Text>
              <Text style={styles.authorDesig}>{item.officer?.designation || 'AC Office'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-PK')}</Text>
            {!!acToken && (
              <TouchableOpacity
                style={styles.deleteActionBtn}
                onPress={() => handleDeleteAnnouncement(item.id, item.title)}
              >
                <Ionicons name="trash-outline" size={16} color="#DC2626" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {!!item.content && <Text style={styles.content}>{item.content}</Text>}

        {images.length > 0 && (
          <View style={styles.imagesWrap}>
            {images.map((img, idx) => (
              <TouchableOpacity key={`${item.id}-img-${idx}`} onPress={() => openViewer(images, idx)} activeOpacity={0.85}>
                <Image source={{ uri: img }} style={styles.imageThumb} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {videos.length > 0 && (
          <View style={styles.mediaList}>
            {videos.map((videoUrl, idx) => (
              <TouchableOpacity
                key={`${item.id}-vid-${idx}`}
                style={styles.mediaRow}
                onPress={() => openVideo(videoUrl)}
              >
                <Ionicons name="videocam" size={20} color="#2563EB" />
                <Text style={styles.mediaText}>Video attachment {idx + 1}</Text>
                <Ionicons name="open-outline" size={16} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!!item.voice && (
          <View style={styles.mediaList}>
            <TouchableOpacity
              style={styles.mediaRow}
              onPress={() => (playingVoiceId === item.id ? stopVoice() : playVoice(item.id, item.voice))}
            >
              <Ionicons
                name={playingVoiceId === item.id ? 'pause-circle' : 'play-circle'}
                size={22}
                color="#059669"
              />
              <Text style={styles.mediaText}>
                Voice note{item.voiceDuration ? ` (${Math.ceil(item.voiceDuration / 1000)} sec)` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.engagementRow}>
          <TouchableOpacity style={styles.likeBtn} onPress={() => toggleLike(item.id)}>
            <Ionicons name={hasLiked ? 'heart' : 'heart-outline'} size={18} color={hasLiked ? '#DC2626' : COLORS.textSecondary} />
            <Text style={styles.engagementText}>{item.likes || 0}</Text>
          </TouchableOpacity>

          <View style={styles.viewsPill}>
            <Ionicons name="eye-outline" size={17} color={COLORS.textSecondary} />
            <Text style={styles.engagementText}>{item.views || 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Announcements</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="megaphone-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No announcements from AC Office yet.</Text>
            </View>
          }
        />
      )}

      <ImageViewer
        images={viewerImages}
        visible={viewerVisible}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      <Modal
        visible={videoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalCard}>
            <View style={styles.videoModalHeader}>
              <Text style={styles.videoModalTitle}>Video Attachment</Text>
              <TouchableOpacity onPress={closeVideoModal} style={styles.videoCloseBtn}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            {!!activeVideoUrl && (
              <Video
                source={{ uri: activeVideoUrl }}
                style={styles.videoPlayer}
                useNativeControls
                shouldPlay
                resizeMode={ResizeMode.CONTAIN}
                onError={() => Alert.alert('Playback Error', 'Could not play video in app. Use browser option below.')}
              />
            )}

            <View style={styles.videoActionsRow}>
              <TouchableOpacity style={styles.videoActionBtn} onPress={openVideoInBrowser}>
                <Ionicons name="open-outline" size={16} color="#1D4ED8" />
                <Text style={styles.videoActionText}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AdBanner at bottom */}
      <View style={{ backgroundColor: COLORS.surface, borderTopWidth: 1, borderColor: COLORS.border, paddingBottom: Math.max(insets.bottom, 10) }}>
        <AdBanner />
      </View>
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
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  headerActions: { alignItems: 'flex-end', gap: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  deleteActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  authorName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  authorDesig: { fontSize: 12, color: COLORS.textLight },
  date: { fontSize: 12, color: COLORS.textSecondary },
  title: { fontSize: 17, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  content: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  imagesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 10 },
  imageThumb: { width: 100, height: 100, borderRadius: 10, backgroundColor: '#E2E8F0' },
  mediaList: { marginBottom: 8 },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  mediaText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  engagementRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 12 },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFF',
  },
  viewsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFF',
  },
  engagementText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '700' },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: COLORS.textSecondary, marginTop: 16, fontSize: 15 },
  videoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  videoModalCard: {
    backgroundColor: '#0B1220',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  videoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  videoModalTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  videoCloseBtn: { padding: 4 },
  videoPlayer: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
  },
  videoActionsRow: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  videoActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  videoActionText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
});
