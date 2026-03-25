import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  Alert, ActivityIndicator, Image, Platform, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { COLORS } from '../config/constants';
import { acAPI } from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ACCreateAnnouncementScreen({ navigation, route }) {
  const { token } = route.params || {};
  const insets = useSafeAreaInsets();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Audio Recording State
  const [recording, setRecording] = useState(null);
  const [isPreparingRecord, setIsPreparingRecord] = useState(false);
  const [voiceUri, setVoiceUri] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const pickMedia = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: type === 'image',
        quality: 0.7,
      });

      if (result.canceled) return;

      if (type === 'image') {
        const newImages = result.assets.slice(0, Math.max(0, 5 - images.length));
        setImages([...images, ...newImages]);
      } else {
        const newVideos = result.assets.slice(0, Math.max(0, 2 - videos.length));
        setVideos([...videos, ...newVideos]);
      }
    } catch (error) {
      Alert.alert('Picker Error', 'Unable to open media picker. Please try again.');
    }
  };

  const startRecording = async () => {
    if (recording || isPreparingRecord) return;
    try {
      setIsPreparingRecord(true);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRecording);
    } catch (err) {
      console.error('Failed to start recording', err);
    } finally {
      setIsPreparingRecord(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const status = await recording.getStatusAsync();
    setVoiceUri(uri);
    setVoiceDuration(status.durationMillis || 0);
  };

  const discardRecording = () => {
    setVoiceUri(null);
    setVoiceDuration(0);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return Alert.alert('Required', 'Please exact title identifying announcement.');
    if (!content.trim() && !voiceUri && images.length === 0 && videos.length === 0) {
      return Alert.alert('Required', 'Provide at least a content description, voice message, or attachment.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (content.trim()) formData.append('content', content.trim());

      images.forEach((img, index) => {
        formData.append('images', { uri: img.uri, type: 'image/jpeg', name: `image${index}.jpg` });
      });

      videos.forEach((vid, index) => {
        formData.append('videos', { uri: vid.uri, type: 'video/mp4', name: `video${index}.mp4` });
      });

      if (voiceUri) {
        formData.append('voice', { uri: voiceUri, type: 'audio/m4a', name: 'voice.m4a' });
        formData.append('voiceDuration', voiceDuration);
      }

      await acAPI.acCreateAnnouncement(token, formData);
      Alert.alert('Success', 'Announcement created successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create announcement.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Announcement</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 40) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Announcement Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Bazar Timings Updated"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Content / Details (Optional)</Text>
          <TextInput
            style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]}
            placeholder="Explain the rules or updates in detail..."
            multiline
            value={content}
            onChangeText={setContent}
          />
        </View>

        <Text style={styles.label}>Attachments (Optional)</Text>
        
        {/* Voice Record Section */}
        <View style={styles.attachmentBox}>
          {voiceUri ? (
            <View style={styles.voiceRecordedBox}>
              <Ionicons name="mic" size={24} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.text }}>Voice Note</Text>
                <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Duration: {formatDuration(voiceDuration)}</Text>
              </View>
              <TouchableOpacity onPress={discardRecording} style={{ padding: 8 }}>
                <Ionicons name="trash" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[styles.recordBtn, recording && styles.recordingBtnActive]} 
              onPressIn={startRecording} 
              onPressOut={stopRecording}
              delayPressIn={0}
            >
              <Ionicons name="mic" size={28} color={recording ? '#fff' : COLORS.primary} />
              <Text style={[styles.recordText, recording && { color: '#fff' }]}>
                {recording ? 'Recording... Release to stop' : 'Hold to record voice note'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Media Attachments Section */}
        <View style={styles.mediaButtonsRow}>
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('image')} disabled={images.length >= 5}>
            <Ionicons name="image" size={24} color={COLORS.primary} />
            <Text style={styles.mediaBtnText}>Add Photo ({images.length}/5)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('video')} disabled={videos.length >= 2}>
            <Ionicons name="videocam" size={24} color={COLORS.primary} />
            <Text style={styles.mediaBtnText}>Add Video ({videos.length}/2)</Text>
          </TouchableOpacity>
        </View>

        {/* Previews */}
        {images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
            {images.map((img, i) => (
               <View key={i} style={styles.previewBox}>
                <Image source={{ uri: img.uri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => setImages(images.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        
        {videos.length > 0 && (
          <View style={styles.videosList}>
            {videos.map((vid, i) => (
              <View key={i} style={styles.videoBox}>
                <Ionicons name="play-circle" size={24} color={COLORS.primary} />
                <Text style={styles.videoName} numberOfLines={1}>{vid.fileName || `Video ${i+1}`}</Text>
                <TouchableOpacity onPress={() => setVideos(videos.filter((_, idx) => idx !== i))} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity 
          style={[styles.submitBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Publish Announcement</Text>}
        </TouchableOpacity>
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
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text,
  },
  attachmentBox: { marginBottom: 16 },
  recordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 20,
  },
  recordingBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, borderStyle: 'solid' },
  recordText: { fontSize: 15, fontWeight: '600', color: COLORS.primary, marginLeft: 10 },
  voiceRecordedBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  mediaButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  mediaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, paddingVertical: 14,
  },
  mediaBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginLeft: 8 },
  previewScroll: { marginBottom: 20 },
  previewBox: { width: 80, height: 80, borderRadius: 10, marginRight: 12, backgroundColor: COLORS.surface, elevation: 1 },
  previewImg: { width: '100%', height: '100%', borderRadius: 10 },
  removeBtn: {
    position: 'absolute', top: -5, right: -5,
    backgroundColor: COLORS.error, width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  videosList: { marginBottom: 20, gap: 10 },
  videoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 12,
  },
  videoName: { flex: 1, fontSize: 13, color: COLORS.text, marginLeft: 10 },
  submitBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 10,
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
