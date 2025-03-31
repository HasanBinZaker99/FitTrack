// ✅ Updated NowPlayingModal.tsx to support favourite toggle
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export interface NowPlayingModalProps {
  visible: boolean;
  songTitle: string;
  repeatMode: boolean;
  repeatAllMode: boolean;
  isPlaying: boolean;
  isFavourite: boolean;
  onToggleFavourite: () => void;
  currentTime: string;
  duration: string;
  onClose: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleRepeat: () => void;
  onToggleRepeatAll: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
}

const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  visible,
  songTitle,
  repeatMode,
  repeatAllMode,
  isPlaying,
  isFavourite,
  currentTime,
  duration,
  onClose,
  onPause,
  onNext,
  onPrev,
  onToggleRepeat,
  onToggleRepeatAll,
  onSeekForward,
  onSeekBackward,
  onToggleFavourite,
}) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.nowPlaying}>Now Playing</Text>
        <Text style={styles.songTitle}>{songTitle}</Text>

        <Text style={styles.timer}>
          {currentTime} / {duration}
        </Text>

        <View style={styles.controls}>
          <TouchableOpacity onPress={onPrev}>
            <Ionicons name="play-skip-back" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSeekBackward}>
            <Ionicons name="play-back" size={28} color="#fff" />
            <Text style={styles.seekLabel}>5s</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onPause}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={40}
              color="#fff"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={onSeekForward}>
            <Ionicons name="play-forward" size={28} color="#fff" />
            <Text style={styles.seekLabel}>5s</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onNext}>
            <Ionicons name="play-skip-forward" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 30 }}>
          <TouchableOpacity
            onPress={onToggleRepeat}
            style={styles.repeatContainer}
          >
            <MaterialIcons
              name="repeat-one"
              size={28}
              color={repeatMode ? "#28a745" : "#888"}
            />
            <Text style={styles.repeatLabel}>Repeat One</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onToggleFavourite}>
            <Ionicons
              name={isFavourite ? "heart" : "heart-outline"}
              size={30}
              color={isFavourite ? "#e74c3c" : "#aaa"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 20,
  },
  nowPlaying: {
    color: "#aaa",
    fontSize: 16,
    marginBottom: 10,
  },
  songTitle: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  timer: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    marginVertical: 20,
  },
  seekLabel: {
    fontSize: 10,
    color: "#ccc",
    textAlign: "center",
    marginTop: -4,
  },
  repeatContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  repeatLabel: {
    color: "#ccc",
    marginLeft: 8,
    fontSize: 14,
  },
});

export default NowPlayingModal;
