import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  Platform,
  Button,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// @ts-ignore
import RadioForm from "react-native-simple-radio-button";

const API_URL = "https://fittrack-0383.onrender.com/create-workoutOptions";

const hobbies = [
  { label: "Teasing", value: "Teasing" },
  { label: "Catching plate", value: "Catching plate" },
  { label: "Soaking in the mud", value: "Soaking in the mud" },
];

export default function CreateWorkout() {
  const [selectedWorkout, setSelectedWorkout] = useState(hobbies[0].value);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const getEmail = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) setUserEmail(email);
    };
    getEmail();
  }, []);

  const saveWorkout = async () => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          workouts: [selectedWorkout], // send as array
        }),
      });

      const json = await response.json();
      if (response.ok) {
        ToastAndroid.show("Saved: " + selectedWorkout, ToastAndroid.SHORT);
        console.log("✅ Saved:", json);
      } else {
        console.warn("❌ Server Error:", json);
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Workout</Text>
      <RadioForm
        radio_props={hobbies}
        initial={0}
        onPress={(value: string) => setSelectedWorkout(value)}
        buttonSize={14}
        buttonOuterSize={24}
        selectedButtonColor={"green"}
        selectedLabelColor={"green"}
        labelStyle={{ fontSize: 20 }}
        formHorizontal={false}
      />
      <Button title="Save Workout" onPress={saveWorkout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
});
