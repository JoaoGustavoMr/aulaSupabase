import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  ActivityIndicator,
} from "react-native";

import { Video } from "expo-av";
import { supabase } from "../SupaBaseConfig";

export default function ListarVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.storage.from("videos").list("", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        console.error("Erro ao listar vídeos:", error.message);
        return;
      }

      const videoFiles = data.filter((file) => file.name.endsWith(".mp4")); 
      const videosWithUrls = await Promise.all(
        videoFiles.map(async (file) => {
          const { data: urlData } = await supabase.storage
            .from("videos")
            .getPublicUrl(file.name);

          return {
            name: file.name,
            url: urlData.publicUrl,
          };
        })
      );

      setVideos(videosWithUrls);
    } catch (err) {
      console.error("Erro ao carregar vídeos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vídeos disponíveis:</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView contentContainerStyle={styles.videoList}>
          {videos.map((video) => (
            <View key={video.name} style={styles.videoContainer}>
              <Text style={styles.videoName}>{video.name}</Text>
              <Video
                source={{ uri: video.url }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                shouldPlay={false}
                useNativeControls
                style={styles.video}
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
    padding: 20,
    backgroundColor: "#17408B",
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    color: "#fff",
    fontWeight: "bold",
  },
  videoList: {
    paddingBottom: 100,
  },
  videoContainer: {
    marginBottom: 30,
  },
  videoName: {
    fontSize: 16,
    marginBottom: 5,
    color: "#fff",
  },
  video: {
    width: "100%",
    height: 200,
    backgroundColor: "#000",
  },
});
