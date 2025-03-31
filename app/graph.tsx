import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface WorkoutEntry {
  date: string;
  workouts: Record<string, boolean>;
}

export default function ShowWorkout() {
  const [history, setHistory] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const raw = await AsyncStorage.getItem("workoutHistory");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const today = new Date();
      const days: WorkoutEntry[] = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const key = date.toISOString().split("T")[0];

        if (parsed[key]) {
          days.push({ date: key, workouts: parsed[key] });
        }
      }

      setHistory(days);
    };

    loadHistory();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Workout History (Last 30 Days)</Text>

      {history.length === 0 ? (
        <Text style={styles.noData}>No workout data available.</Text>
      ) : (
        history.map((entry, index) => (
          <View key={index} style={styles.entry}>
            <Text style={styles.date}>{entry.date}</Text>
            {Object.entries(entry.workouts).map(([name, isChecked], i) => (
              <View key={i} style={styles.checkboxContainer}>
                <Checkbox value={isChecked} disabled={true} />
                <Text style={styles.checkboxLabel}>{name}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  entry: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  date: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    marginLeft: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  noData: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
});
