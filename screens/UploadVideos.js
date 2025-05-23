import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { Video } from 'expo-av'; // ✅ CERTO
import { decode as atob } from 'base-64';
import { supabase } from '../SupaBaseConfig';

const BUCKET_NAME = 'videos';

export default function VideoUpload() {
  const [videoUri, setVideoUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Pede permissão para notificações assim que o componente monta
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Permita o acesso às notificações.');
      }
    };
    requestNotificationPermission();
  }, []);

  const escolherVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      const asset = result.assets?.[0];

      if (asset?.uri) {
        setVideoUri(asset.uri);
        setMessage('');
      } else {
        setMessage('Seleção cancelada.');
        setVideoUri(null);
      }
    } catch (error) {
      console.error('Erro ao escolher vídeo:', error);
      setMessage('Erro ao escolher vídeo.');
    }
  };

  // Função para enviar notificação de upload concluído
  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Upload concluído',
        body: 'Seu vídeo foi enviado com sucesso!',
        sound: true,
      },
      trigger: { seconds: 1 },
    });
  };

  const uploadVideo = async () => {
    if (!videoUri) {
      setMessage('Nenhum vídeo selecionado.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const fileName = `${Date.now()}.mp4`;
      let fileData;

      if (Platform.OS === 'web') {
        const response = await fetch(videoUri);
        fileData = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(videoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        fileData = new Uint8Array(byteNumbers);
      }

      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileData, {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (error) {
        console.error('Erro ao enviar vídeo:', error);
        setMessage(`Erro ao enviar: ${error.message}`);
      } else {
        setMessage('Vídeo enviado com sucesso!');
        setVideoUri(null);
        await sendNotification(); // Notificação aqui
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setMessage('Erro inesperado ao enviar o vídeo.');
    }

    setUploading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enviar vídeo para Supabase </Text>

      <Pressable style={styles.button} onPress={escolherVideo}>
        <Text style={styles.buttonText}>Escolher vídeo</Text>
      </Pressable>

      {videoUri && (
        <Video
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      )}

      <Pressable
        style={[styles.button, uploading && styles.disabled]}
        onPress={uploadVideo}
        disabled={uploading || !videoUri}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'Enviando...' : 'Enviar vídeo'}
        </Text>
      </Pressable>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#17408B',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FEBE10',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#17408B',
    fontWeight: 'bold',
  },
  video: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    backgroundColor: '#000',
  },
  message: {
    marginTop: 20,
    color: '#FFF',
    textAlign: 'center',
  },
});
