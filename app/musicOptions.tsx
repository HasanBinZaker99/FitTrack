import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as MediaLibrary from "expo-media-library";
import {
  Audio,
  AVPlaybackStatus,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from "expo-av";

import NowPlayingModal from "./NowPlayingModal";

const { height } = Dimensions.get("window");

export default function MusicOptions() {
  const [songs, setSongs] = useState<{ uri: string; name: string }[]>([]);
  const [favourites, setFavourites] = useState<{ uri: string; name: string }[]>(
    []
  );
  const [isFavouriteView, setIsFavouriteView] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const currentIndexRef = useRef<number | null>(null);

  const [showPlayer, setShowPlayer] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const [repeatAllMode, setRepeatAllMode] = useState(false);

  const repeatModeRef = useRef(repeatMode);
  const repeatAllModeRef = useRef(repeatAllMode);

  const [playbackStatus, setPlaybackStatus] = useState<AVPlaybackStatus | null>(
    null
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const sound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);
  useEffect(() => {
    repeatAllModeRef.current = repeatAllMode;
  }, [repeatAllMode]);

  const requestAndroidPermissions = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn("Storage permission denied");
      }
    }
  };

  useEffect(() => {
    requestAndroidPermissions();
    loadSongs();
    // Optionally unload sound on unmount to free resources
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const loadSongs = async () => {
    const stored = await AsyncStorage.getItem("localSongs");
    if (stored) {
      setSongs(JSON.parse(stored));
    }
  };

  const fetchAllAudioFiles = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") return;

    const media = await MediaLibrary.getAssetsAsync({ mediaType: "audio" });
    const audioAssets = media.assets.map((asset) => ({
      uri: asset.uri,
      name: asset.filename,
    }));
    setSongs(audioAssets);
    await AsyncStorage.setItem("localSongs", JSON.stringify(audioAssets));
  };

  const pickFromFavourites = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      multiple: true,
    });
    if (result.assets && result.assets.length > 0) {
      const newSongs = result.assets.map((file) => ({
        uri: file.uri,
        name: file.name,
      }));
      setFavourites((prev) => [...prev, ...newSongs]);
    }
  };

  const onPlaybackStatusUpdate = useCallback(
    async (status: AVPlaybackStatus) => {
      setPlaybackStatus(status);
      if (!status.isLoaded) return;
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        const list = isFavouriteView ? favourites : songs;
        const current = currentIndexRef.current;

        if (repeatModeRef.current && current !== null) {
          // Repeat one song
          await playSong(current);
          return;
        }
        if (current !== null && current + 1 < list.length) {
          // Play next song in list
          await playSong(current + 1);
        } else if (repeatAllModeRef.current && list.length > 0) {
          // Restart from beginning if repeat-all is enabled
          await playSong(0);
        } else {
          // No more songs: stop playback and reset
          await unloadSound();
          setCurrentIndex(null);
          currentIndexRef.current = null;
          setShowPlayer(false);
          setIsPlaying(false);
        }
      }
    },
    [favourites, songs, isFavouriteView]
  );

  const playSong = async (index: number) => {
    try {
      await unloadSound();
      const list = isFavouriteView ? favourites : songs;
      const { uri } = list[index];

      // Configure audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      sound.current = newSound;
      newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      await newSound.playAsync();

      setCurrentIndex(index);
      currentIndexRef.current = index;
      setShowPlayer(true);
      setIsPlaying(true);
      setIsFavourite(favourites.some((song) => song.uri === uri));
    } catch (e) {
      console.error("Error playing song:", e);
    }
  };

  const handlePause = async () => {
    if (sound.current) {
      const status = await sound.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
      } else if (status.isLoaded && !status.isPlaying) {
        await sound.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleToggleFavourite = () => {
    const list = isFavouriteView ? favourites : songs;
    if (currentIndexRef.current === null) return;

    const current = list[currentIndexRef.current];
    if (!current) return; // Safe check in case index is out of bounds

    const alreadyFav = favourites.some((fav) => fav.uri === current.uri);
    if (alreadyFav) {
      setFavourites((prev) => prev.filter((fav) => fav.uri !== current.uri));
    } else {
      setFavourites((prev) => [...prev, current]);
    }
    setIsFavourite(!alreadyFav);
  };

  const unloadSound = async () => {
    if (sound.current) {
      sound.current.setOnPlaybackStatusUpdate(null);
      await sound.current.unloadAsync();
      sound.current = null;
    }
  };

  const seekBy = async (offsetMs: number) => {
    if (!sound.current) return;
    const status = await sound.current.getStatusAsync();
    if (status.isLoaded) {
      // Calculate new position (clamp between 0 and duration)
      let newPos = status.positionMillis + offsetMs;
      newPos = Math.max(0, Math.min(newPos, status.durationMillis ?? 0));
      await sound.current.setPositionAsync(newPos);
    }
  };

  const formatTime = (millis?: number): string => {
    if (!millis) return "00:00";
    const minutes = Math.floor(millis / 60000);
    const seconds = Math.floor((millis % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const currentTime = playbackStatus?.isLoaded
    ? formatTime(playbackStatus.positionMillis)
    : "00:00";
  const duration = playbackStatus?.isLoaded
    ? formatTime(playbackStatus.durationMillis)
    : "00:00";

  const activeList = isFavouriteView ? favourites : songs;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎧 Music Player</Text>

      {/* Tab Switcher between All Songs and Favourites */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, !isFavouriteView && styles.activeTab]}
          onPress={() => setIsFavouriteView(false)}
        >
          <Text style={styles.tabText}>📁 Song Folder</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, isFavouriteView && styles.activeTab]}
          onPress={() => setIsFavouriteView(true)}
        >
          <Text style={styles.tabText}>❤️ Favourites</Text>
        </TouchableOpacity>
      </View>

      {isFavouriteView ? (
        <TouchableOpacity style={styles.button} onPress={pickFromFavourites}>
          <Text style={styles.buttonText}>📂 Pick Music File</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={fetchAllAudioFiles}>
          <Text style={styles.buttonText}>📂 Load All Audio Files</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={activeList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.songItem}
            onPress={() => playSong(index)}
          >
            <Text>
              {index + 1}. {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <NowPlayingModal
        visible={showPlayer}
        songTitle={
          currentIndex !== null && currentIndex < activeList.length
            ? activeList[currentIndex].name
            : ""
        }
        repeatMode={repeatMode}
        repeatAllMode={repeatAllMode}
        isPlaying={isPlaying}
        isFavourite={isFavourite}
        currentTime={currentTime}
        duration={duration}
        onClose={async () => {
          await unloadSound();
          setShowPlayer(false);
        }}
        onPause={handlePause}
        onNext={() => {
          const next =
            currentIndexRef.current !== null ? currentIndexRef.current + 1 : 0;
          if (next < activeList.length) playSong(next);
        }}
        onPrev={() => {
          const prev =
            currentIndexRef.current !== null ? currentIndexRef.current - 1 : 0;
          if (prev >= 0) playSong(prev);
        }}
        onToggleRepeat={() => setRepeatMode((prev) => !prev)}
        onToggleRepeatAll={() => setRepeatAllMode((prev) => !prev)}
        onToggleFavourite={handleToggleFavourite}
        onSeekForward={() => seekBy(5000)}
        onSeekBackward={() => seekBy(-5000)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  tabSwitcher: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  tabText: { color: "#333", fontWeight: "bold" },
  activeTab: { backgroundColor: "#007bff" },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  songItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: "#ddd" },
});
