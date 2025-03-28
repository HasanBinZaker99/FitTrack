import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router"; // ✅ Use navigation
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      let response = await fetch("https://fittrack-0383.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      // console.log(response);
      let result = await response.json();
      if (response.status === 200) {
        await AsyncStorage.setItem("userEmail", email); // ✅ Store email
        //console.log("✅ Email stored in AsyncStorage:", email);
        router.push("/home");
      } else {
        Alert.alert("Login Failed", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={{ marginTop: 10, width: "60%" }}>
        <Button title="Login" onPress={handleLogin} />
      </View>
      <View style={{ marginTop: 10, width: "60%" }}>
        <Button title="Register" color="green" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
});
