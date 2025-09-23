import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import { getToken } from '@/shared/helpers/storeToken';
import Constants from 'expo-constants';

interface VideoUploadProps {
  event: any; // pass in the selected play session
}

export default function VideoUpload({ event }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handlePickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'cancel') return;

// On new versions, result has an `assets` array
const asset = result.assets?.[0];
if (!asset) return;

const fileUri = asset.uri;
const fileName = asset.name || 'video.mp4';
const fileType = asset.mimeType || 'video/mp4';


      // Build metadata payload
      const payload = {
        location: event?.allCourts?.Location ?? 'Unknown',
        eventId: event?.id,
        eventName: event?.eventName,
        players: event?.registeredPlayers || [],
        subscriptionRequired: true,
      };

      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as any);
      formData.append('payload', JSON.stringify(payload));

      const token = await getToken();
            
            console.log('📦 Token from getToken():', token);
            const BASE_URL = Constants.expoConfig?.extra?.apiUrl;

      const response = await fetch(`${BASE_URL}/api/videos/upload`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      Toast.show({
        type: 'success',
        text1: 'Video uploaded successfully!',
        topOffset: 100,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: err.message || 'Something went wrong',
        topOffset: 100,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        disabled={uploading}
        onPress={handlePickVideo}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Upload Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, paddingHorizontal: 16 },
  button: {
    backgroundColor: '#2F7C83',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
