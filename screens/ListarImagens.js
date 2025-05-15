import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../SupaBaseConfig";

const BUCKET_NAME = "imagens";

export default function ListarImagens() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .storage
          .from(BUCKET_NAME)
          .list("", { limit: 100 });

        if (error) throw error;

        const imageFiles = data.filter(file =>
          file.name.match(/\.(jpg|jpeg|png)$/i)
        );

        const imageURLs = imageFiles.map(file => ({
          name: file.name,
          url: supabase
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(file.name).data.publicUrl,
        }));

        setImages(imageURLs);
      } catch (error) {
        console.error("Erro ao listar imagens:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Imagens</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <ScrollView contentContainerStyle={styles.imageList}>
          {images.map((img) => (
            <View key={img.url} style={styles.imageContainer}>
              <Text style={styles.imageName}>{img.name}</Text>
              <Image
                source={{ uri: img.url }}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#17408B",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  imageList: {
    paddingBottom: 100,
  },
  imageContainer: {
    marginBottom: 20,
  },
  imageName: {
    fontSize: 14,
    marginBottom: 5,
    color: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#eee",
  }
});
