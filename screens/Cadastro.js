import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../SupaBaseConfig';
import { Buffer } from 'buffer'; // necessário pro base64

export default function SignupScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar a galeria é necessária!');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  

  const generateUUID = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  
  const uploadImage = async () => {
    if (!image) return '';
  
    const base64 = await FileSystem.readAsStringAsync(image, {
      encoding: FileSystem.EncodingType.Base64,
    });
  
    const fileExt = image.split('.').pop();
    const fileName = `${generateUUID()}.${fileExt}`;
    const filePath = `perfil/${fileName}`;
  
    const { error } = await supabase.storage
      .from('fotos-perfil')
      .upload(filePath, Buffer.from(base64, 'base64'), {
        contentType: 'image/jpeg',
      });
  
    if (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  
    const { data } = supabase.storage
      .from('fotos-perfil')
      .getPublicUrl(filePath);
  
    return data.publicUrl;
  };
  

  const handleSignup = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) throw error;

      const userId = data.user.id;

      let uploadedPhotoURL = '';
      if (image) {
        uploadedPhotoURL = await uploadImage();
      }

      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id_user: userId,
            nome_user: nome,
            email_user: email,
            photoURL_user: uploadedPhotoURL,
          },
        ]);

      if (insertError) throw insertError;

      setMessage({ type: 'success', text: 'Cadastro realizado com sucesso!' });
    } catch (err) {
      console.error('Erro:', err);
      setMessage({ type: 'error', text: err.message });
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        onChangeText={setNome}
        value={nome}
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={styles.imagePickerText}>Selecionar Foto</Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image }} style={styles.preview} />}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Cadastrar" onPress={handleSignup} />
      )}

      {message && (
        <Text
          style={[
            styles.message,
            { color: message.type === 'error' ? 'red' : 'green' },
          ]}
        >
          {message.text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  imagePicker: {
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePickerText: {
    color: '#000',
  },
  preview: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 50,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});
