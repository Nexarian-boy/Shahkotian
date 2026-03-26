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

export default function ACComplaintScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Audio Recording State
  const [recording, setRecording] = useState(null);
  const [isPreparingRecord, setIsPreparingRecord] = useState(false);
  const [voiceUri, setVoiceUri] = useState(null);
  const [voiceDuration, setVoiceDuration] = useState(0);

  const resolvePickerMediaType = (type) => {
    // Support both legacy MediaTypeOptions and newer MediaType shapes across Expo SDKs.
    if (ImagePicker.MediaType) {
      if (type === 'video') {
        return ImagePicker.MediaType.videos || ImagePicker.MediaType.video;
      }
      return ImagePicker.MediaType.images || ImagePicker.MediaType.image;
    }

    if (type === 'video') {
      return ImagePicker.MediaTypeOptions.Videos;
    }
    return ImagePicker.MediaTypeOptions.Images;
  };

  const pickMedia = async (type) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Please allow media library access to attach photos/videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: resolvePickerMediaType(type),
        allowsMultipleSelection: type === 'image',
        selectionLimit: type === 'image' ? Math.max(1, 5 - images.length) : 1,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      if (type === 'image') {
        setImages((prev) => [...prev, ...result.assets].slice(0, 5));
      } else {
        setVideos((prev) => [...prev, ...result.assets].slice(0, 2));
      }
    } catch (error) {
      console.error('Media picker error:', error);
      Alert.alert('Error', 'Could not open media picker. Please try again.');
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
    if (!title.trim()) return Alert.alert('Required', 'Please exact title identifying issue.');
    if (!description.trim() && !voiceUri && images.length === 0 && videos.length === 0) {
      return Alert.alert('Required', 'Provide at least a description, voice message, or attachment.');
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      if (description.trim()) formData.append('description', description.trim());

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

      await acAPI.submitComplaint(formData);
      Alert.alert('Success', 'Complaint submitted successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('ACComplaintHistory') }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit complaint.');
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
        <Text style={styles.headerTitle}>New Complaint</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 40) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={18} color="#15803D" />
          <Text style={styles.verifiedText}>CNIC Verified — Ready to Submit</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Complaint Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Encroachment in Main Bazar"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, { minHeight: 120, textAlignVertical: 'top' }]}
            placeholder="Explain the issue in detail..."
            multiline
            value={description}
            onChangeText={setDescription}
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

        {/* Media Previews */}
        {(images.length > 0 || videos.length > 0) && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewsContainer}>
            {images.map((img, index) => (
              <View key={`img-${index}`} style={styles.previewBox}>
                <Image source={{ uri: img.uri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setImages(images.filter((_, i) => i !== index))}>
                  <Ionicons name="close-circle" size={22} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
            {videos.map((vid, index) => (
              <View key={`vid-${index}`} style={styles.previewBox}>
                <View style={[styles.previewImg, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="play-circle" size={32} color="rgba(255,255,255,0.8)" />
                </View>
                <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setVideos(videos.filter((_, i) => i !== index))}>
                  <Ionicons name="close-circle" size={22} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Complaint</Text>}
        </TouchableOpacity>
      </View>
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
  scrollContent: { padding: 16, paddingBottom: 100 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7',
    padding: 10, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#86EFAC'
  },
  verifiedText: { fontSize: 13, fontWeight: '600', color: '#15803D', marginLeft: 6 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.text
  },
  attachmentBox: { marginBottom: 16 },
  recordBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primaryLight + '20', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed'
  },
  recordingBtnActive: { backgroundColor: COLORS.error, borderColor: COLORS.error, borderStyle: 'solid' },
  recordText: { fontSize: 14, fontWeight: '600', color: COLORS.primary, marginLeft: 10 },
  voiceRecordedBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12
  },
  mediaButtonsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  mediaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 10, padding: 12
  },
  mediaBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginLeft: 8 },
  previewsContainer: { flexDirection: 'row', marginBottom: 20 },
  previewBox: { width: 80, height: 80, marginRight: 12, borderRadius: 8, overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%', borderRadius: 8 },
  removeMediaBtn: {
    position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  button: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' }
});
