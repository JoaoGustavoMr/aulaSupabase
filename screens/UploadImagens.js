import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Alert,
  Pressable,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Notifications from "expo-notifications";
import { decode as atob } from "base-64";
import { supabase } from "../SupaBaseConfig";

const BUCKET_NAME = "imagens";

const UploadFoto = () => {
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false); // estado de carregamento

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Permita o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upload concluído",
        body: "Sua imagem foi enviada com sucesso!",
        sound: true,
      },
      trigger: null,
    });
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("Erro", "Selecione uma imagem primeiro.");
      return;
    }

    setUploading(true); // começa o carregamento

    try {
      const fileName = `${Date.now()}.jpg`;
      let fileData;

      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        fileData = await response.blob();
      } else {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
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
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) {
        console.error("Erro no upload:", error);
        Alert.alert("Erro", "Falha ao enviar imagem.");
      } else {
        Alert.alert("Sucesso", "Imagem enviada com sucesso!");
        await sendNotification();
        setImageUri(null);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      Alert.alert("Erro", "Erro inesperado ao enviar imagem.");
    }

    setUploading(false); // finaliza o carregamento
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable style={styles.button} onPress={escolherImagem}>
        <Text style={styles.buttonText}>Escolher Imagem</Text>
      </Pressable>

      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Pressable
        style={[styles.buttonUpload, uploading && styles.disabledButton]}
        onPress={uploadImage}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? "Enviando..." : "Enviar para Supabase"}
        </Text>
      </Pressable>

      {uploading && (
        <ActivityIndicator size="large" color="#FFF" style={{ marginTop: 20 }} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#17408B",
    height: "100%",
  },
  button: {
    backgroundColor: "#FEBE10",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  buttonUpload: {
    backgroundColor: "#FEBE10",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#17408B",
    fontWeight: "bold",
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
});

export default UploadFoto;
