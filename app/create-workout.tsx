import React from "react";
import { StyleSheet, Text, View, ToastAndroid, Platform } from "react-native";

const API_URL = "https://gymtracker-3.onrender.com/create-workout";
// @ts-ignore
import RadioForm from "react-native-simple-radio-button";

// Define the radio button data
const hobbies = [
  { label: "Teasing", value: 0 },
  { label: "Catching plate", value: 1 },
  { label: "Soaking in the mud", value: 2 },
];

const App: React.FC = () => {
  const handlePress = (value: number) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(value.toString(), ToastAndroid.SHORT);
    } else {
      console.log("Selected value:", value);
    }
  };

  return (
    <View style={styles.container}>
      <RadioForm
        radio_props={hobbies}
        initial={1}
        onPress={handlePress}
        buttonSize={14}
        buttonOuterSize={24}
        selectedButtonColor={"green"}
        selectedLabelColor={"green"}
        labelStyle={{ fontSize: 20 }}
        formHorizontal={false}
      />
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F5FCFF",
    paddingHorizontal: 20,
  },
});

// import React, { useState, useEffect } from "react";
// import {
//   CheckBox,
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
// } from "react-native";
// import DateTimePickerModal from "react-native-modal-datetime-picker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRouter } from "expo-router";
// import moment from "moment";
// import axios from "axios";

// const API_URL = "https://gymtracker-3.onrender.com/create-workout";

// export default function CreateWorkout() {
//   const [isSelected, setSelection] = useState(false);
//   const router = useRouter();
//   const [selectWorkouts, setSelectedWorkouts] = useState<string[]>([]);
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [workoutOptions, setWorkoutOptions] = useState<string[]>([]);
//   const [tickStatuses, setTickStatuses] = useState<{ [key: string]: string }>(
//     {}
//   );

//   const [userEmail, setUserEmail] = useState("");

//   return (

//   )
// }
// const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     checkboxContainer: {
//       flexDirection: 'row',
//       marginBottom: 20,
//     },
//     checkbox: {
//       alignSelf: 'center',
//     },
//     label: {
//       margin: 8,
//     },
//   });
