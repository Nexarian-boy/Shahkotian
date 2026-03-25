import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { COLORS } from '../config/constants';
import { acAPI } from '../services/api';
import ImageViewer from '../components/ImageViewer';

export default function ACComplaintDetailScreen({ navigation, route }) {
  const { id, token } = route.params;
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaViewer, setMediaViewer] = useState(null);

  useEffect(() => {
    fetchComplaint();
    return () => { if (sound) sound.unloadAsync(); };
  }, []);

  const fetchComplaint = async () => {
    try {
      const res = await acAPI.getComplaintDetail(token, id);
      setComplaint(res.data.complaint);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load complaint details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      await acAPI.updateComplaintStatus(token, id, status);
      Alert.alert('Success', `Status updated to ${status}.`);
      fetchComplaint(); // Refresh
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePlayVoice = async (url) => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false });
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
        setSound(newSound);
        setIsPlaying(true);
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) setIsPlaying(false);
        });
      }
    } catch (e) {
      console.error("Audio play error", e);
    }
  };

  if (loading || !complaint) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  const { complainant, attachments, status, rating } = complaint;
  const voice = attachments.find(a => a.type === 'VOICE');
  const images = attachments.filter(a => a.type === 'IMAGE');
  const videos = attachments.filter(a => a.type === 'VIDEO');

  const getStatusColor = (s) => {
    if (s === 'NEW') return '#0284C7'; // Blue
    if (s === 'WORKING') return '#D97706'; // Amber/Yellow
    if (s === 'SOLVED') return '#15803D'; // Green
    return '#64748B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complaint Detail</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Status Header */}
        <View style={styles.statusSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.complaintId}>ID: {complaint.id.substring(0, 8).toUpperCase()}</Text>
            <Text style={styles.dateText}>{new Date(complaint.createdAt).toLocaleString('en-PK')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
            <Text style={styles.statusBadgeText}>{status}</Text>
          </View>
        </View>

        {rating && (
          <View style={styles.ratingCard}>
            <Text style={styles.ratingLabel}>Complainant's Rating:</Text>
            <View style={{ flexDirection: 'row', marginLeft: 10 }}>
              {[...Array(5)].map((_, i) => (
                <Ionicons key={i} name={i < rating ? "star" : "star-outline"} size={20} color="#F59E0B" />
              ))}
            </View>
          </View>
        )}

        {/* Complainant Identity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Complainant Verification</Text>
          <View style={styles.identityRow}>
            <Ionicons name="person" size={20} color={COLORS.textSecondary} />
            <Text style={styles.identityText}>{complainant.user?.name}</Text>
          </View>
          <View style={styles.identityRow}>
            <Ionicons name="call" size={20} color={COLORS.textSecondary} />
            <Text style={styles.identityText}>{complainant.phone}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${complainant.phone}`)} style={styles.actionIconBtn}>
              <Ionicons name="call" size={16} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL(`whatsapp://send?phone=${complainant.phone}`)} style={[styles.actionIconBtn, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { marginTop: 12, marginBottom: 8 }]}>CNIC Photos:</Text>
          <View style={styles.cnicRow}>
            <TouchableOpacity style={styles.cnicImgWrapper} onPress={() => setMediaViewer(complainant.cnicFront)}>
              <Image source={{ uri: complainant.cnicFront }} style={styles.cnicImg} />
              <View style={styles.cnicLabel}><Text style={styles.cnicLabelTxt}>FRONT</Text></View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cnicImgWrapper} onPress={() => setMediaViewer(complainant.cnicBack)}>
              <Image source={{ uri: complainant.cnicBack }} style={styles.cnicImg} />
              <View style={styles.cnicLabel}><Text style={styles.cnicLabelTxt}>BACK</Text></View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Complaint Content */}
        <View style={[styles.card, { borderColor: '#BFDBFE', borderWidth: 1 }]}>
          <Text style={[styles.sectionTitle, { color: '#1E40AF' }]}>Complaint Issue</Text>
          <Text style={styles.issueTitle}>{complaint.title}</Text>
          {complaint.description && <Text style={styles.issueDesc}>{complaint.description}</Text>}

          {/* Voice Note */}
          {voice && (
            <View style={styles.voicePlayer}>
              <TouchableOpacity onPress={() => handlePlayVoice(voice.url)} style={styles.playBtn}>
                <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#fff" />
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.voiceTitle}>Voice Note</Text>
                {voice.voiceDuration && <Text style={styles.voiceDuration}>{Math.round(voice.voiceDuration / 1000)} seconds</Text>}
              </View>
              <View style={styles.waveform}><Ionicons name="options" size={24} color={COLORS.primary} /></View>
            </View>
          )}

          {/* Images */}
          {images.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.label}>Attached Photos:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((img, i) => (
                  <TouchableOpacity key={i} style={styles.mediaBox} onPress={() => setMediaViewer(img.url)}>
                    <Image source={{ uri: img.url }} style={styles.mediaImg} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.label}>Attached Videos:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {videos.map((vid, i) => (
                  <TouchableOpacity key={i} style={styles.mediaBox} onPress={() => Linking.openURL(vid.url)}>
                    <View style={styles.videoPlaceholder}>
                      <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Update Status</Text>
          <View style={styles.actionBtnsRow}>
            {status !== 'WORKING' && status !== 'SOLVED' && (
              <TouchableOpacity style={[styles.statusUpdateBtn, { backgroundColor: '#F59E0B' }]} onPress={() => updateStatus('WORKING')} disabled={updating}>
                <Ionicons name="construct" size={20} color="#fff" />
                <Text style={styles.statusUpdateTxt}>Mark Working</Text>
              </TouchableOpacity>
            )}
            
            {status !== 'SOLVED' && (
              <TouchableOpacity style={[styles.statusUpdateBtn, { backgroundColor: '#10B981', flex: 1, marginLeft: 10 }]} onPress={() => updateStatus('SOLVED')} disabled={updating}>
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={styles.statusUpdateTxt}>Mark Solved</Text>
              </TouchableOpacity>
            )}
          </View>
          {status === 'SOLVED' && (
            <View style={styles.solvedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#15803D" />
              <Text style={styles.solvedBadgeTxt}>Issue has been resolved</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {mediaViewer && (
        <ImageViewer
          visible={true}
          images={[mediaViewer]}
          initialIndex={0}
          onClose={() => setMediaViewer(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E3A8A', paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statusSection: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  complaintId: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  dateText: { fontSize: 12, color: COLORS.textLight },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  ratingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  ratingLabel: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 18, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  identityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  identityText: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginLeft: 12, flex: 1 },
  actionIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  cnicRow: { flexDirection: 'row', gap: 12 },
  cnicImgWrapper: { flex: 1, height: 100, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' },
  cnicImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  cnicLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, alignItems: 'center' },
  cnicLabelTxt: { fontSize: 10, fontWeight: 'bold', color: '#fff' },
  issueTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  issueDesc: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24, marginBottom: 20 },
  voicePlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  playBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center' },
  voiceTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF' },
  voiceDuration: { fontSize: 12, color: '#3B82F6', marginTop: 2 },
  waveform: { marginRight: 10, opacity: 0.8 },
  mediaSection: { marginBottom: 16 },
  mediaBox: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden', marginRight: 12, marginTop: 8 },
  mediaImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoPlaceholder: { width: '100%', height: '100%', backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  actionsContainer: { marginTop: 8 },
  actionBtnsRow: { flexDirection: 'row' },
  statusUpdateBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12, elevation: 2 },
  statusUpdateTxt: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  solvedBadge: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#DCFCE7', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#86EFAC' },
  solvedBadgeTxt: { fontSize: 16, fontWeight: 'bold', color: '#15803D', marginLeft: 8 }
});
