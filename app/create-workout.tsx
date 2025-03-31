import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  Platform,
} from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateWorkout() {
  const [workouts, setWorkouts] = useState<string[]>([]);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState<"date" | "time" | null>(null);

  useEffect(() => {
    const loadWorkouts = async () => {
      const stored = await AsyncStorage.getItem("workItem");
      const parsed = stored ? JSON.parse(stored) : ["Arms", "Legs", "Biceps"];
      setWorkouts(parsed);
    };
    loadWorkouts();
  }, []);

  useEffect(() => {
    setSelectAll(
      workouts.length > 0 && selectedWorkouts.length === workouts.length
    );
  }, [selectedWorkouts, workouts]);

  const handleToggle = (item: string) => {
    if (selectedWorkouts.includes(item)) {
      setSelectedWorkouts((prev) => prev.filter((i) => i !== item));
    } else {
      setSelectedWorkouts((prev) => [...prev, item]);
    }
  };

  const handleSelectAll = () => {
    const newValue = !selectAll;
    setSelectAll(newValue);
    setSelectedWorkouts(newValue ? [...workouts] : []);
  };

  const handleSave = async () => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const existingData = await AsyncStorage.getItem("workoutHistory");
      const parsedData = existingData ? JSON.parse(existingData) : {};

      const workoutMap: Record<string, boolean> = {};
      workouts.forEach((w) => {
        workoutMap[w] = selectedWorkouts.includes(w);
      });

      parsedData[formattedDate] = workoutMap;

      await AsyncStorage.setItem("workoutHistory", JSON.stringify(parsedData));

      ToastAndroid.show("✅ Workouts & Date Saved", ToastAndroid.SHORT);
    } catch (error) {
      console.error("❌ Failed to save workout:", error);
    }
  };

  const onChangeDateTime = (event: any, selected?: Date) => {
    if (selected) setDate(selected);
    setShowPicker(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Choose Workouts</Text>

      <TouchableOpacity onPress={handleSelectAll}>
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={selectAll}
            onValueChange={handleSelectAll}
            color="green"
          />
          <Text style={styles.label}>Select All</Text>
        </View>
      </TouchableOpacity>

      {workouts.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => handleToggle(item)}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={selectedWorkouts.includes(item)}
              onValueChange={() => handleToggle(item)}
              color="dodgerblue"
            />
            <Text style={styles.label}>{item}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowPicker("date")}
        >
          <Text style={styles.buttonText}>📅 {date.toDateString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateTimeButton}
          onPress={() => setShowPicker("time")}
        >
          <Text style={styles.buttonText}>
            ⏰{" "}
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode={showPicker}
          display="default"
          onChange={onChangeDateTime}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>SAVE WORKOUT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 18,
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  dateTimeButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  saveButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#28a745",
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
