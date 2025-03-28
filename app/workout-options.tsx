import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function WorkoutOptions() {
  const router = useRouter();
  const [WorkItem, setWorkItem] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<string>("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editedWorkout, setEditedWorkout] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  // Load saved workouts when the screen loads
  useEffect(() => {
    const loadWorkouts = async () => {
      const savedWorkouts = await AsyncStorage.getItem("workItem");
      if (savedWorkouts) {
        setWorkItem(JSON.parse(savedWorkouts));
      } else {
        setWorkItem(["Arm"]);
      }
    };
    loadWorkouts();
  }, []);

  // Save Workout
  const saveWorkouts = async (options: string[]) => {
    try {
      await AsyncStorage.setItem("workItem", JSON.stringify(options));
      const email = await AsyncStorage.getItem("userEmail");
      if (!email) return;

      const response = await fetch(
        "https://fittrack-0383.onrender.com/create-workoutOptions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, workouts: options }),
        }
      );

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log("🟢 Server Response:", result);
      } else {
        const text = await response.text(); // fallback if response is not JSON
        console.warn("⚠️ Unexpected response (not JSON):", text);
      }
    } catch (error) {
      console.error("❌ Error sending to server:", error);
    }
  };

  // Add workout
  const addWorkout = () => {
    if (newItem.trim() === "" || WorkItem.includes(newItem.trim())) {
      Alert.alert("Error", "Invalid or duplicate workout!");
      return;
    }
    const updatedWorkouts = [...WorkItem, newItem.trim()];
    setWorkItem(updatedWorkouts);
    saveWorkouts(updatedWorkouts);
    setNewItem("");
  };

  // Open Edit Modal
  const openEditModal = (index: number) => {
    setEditIndex(index);
    setEditedWorkout(WorkItem[index]);
    setModalVisible(true);
  };

  // Delete Workout
  const deleteWorkout = (index: number) => {
    Alert.alert("Delete Workout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedWorkouts = WorkItem.filter((_, i) => i !== index);
          setWorkItem(updatedWorkouts);
          saveWorkouts(updatedWorkouts);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Workout Options</Text>

      {/* Input to add new workout */}
      <TextInput
        style={styles.input}
        placeholder="Enter new item"
        value={newItem}
        onChangeText={setNewItem}
      />
      <TouchableOpacity style={styles.addButton} onPress={addWorkout}>
        <Text style={styles.buttonText}>+ Add Workout</Text>
      </TouchableOpacity>

      {/* List of workouts */}
      <FlatList
        data={WorkItem}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.workoutListItem}>
            <Text style={styles.listItemText}>{item}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                onPress={() => openEditModal(index)}
                style={styles.editButton}
              >
                <Text style={styles.buttonText}>✏️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteWorkout(index)}
              >
                <Text style={styles.buttonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* ✏️ Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Edit Workout</Text>
            <TextInput
              style={styles.input}
              value={editedWorkout}
              onChangeText={setEditedWorkout}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: "#007bff" }]}
                onPress={() => {
                  if (editedWorkout.trim() === "") {
                    Alert.alert("Error", "Workout name cannot be empty!");
                    return;
                  }
                  const updatedWorkouts = [...WorkItem];
                  updatedWorkouts[editIndex!] = editedWorkout.trim();
                  setWorkItem(updatedWorkouts);
                  saveWorkouts(updatedWorkouts);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: "#6c757d" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    width: "45%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: "#fff",
  },
  workoutListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3e3e3",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: "100%",
  },
  listItemText: {
    fontSize: 18,
  },
  buttonGroup: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: "#ffcc00",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
});
