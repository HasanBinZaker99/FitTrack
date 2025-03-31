import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function Contact() {
  const [comment, setComment] = useState("");

  const handleSend = async () => {
    if (comment.trim() === "") {
      Alert.alert("Please write a message before sending.");
      return;
    }

    try {
      const response = await fetch(
        "https://formsubmit.co/ajax/mdhbz99d@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            message: comment,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("✅ Message sent successfully!");
        setComment("");
      } else {
        Alert.alert("❌ Failed to send message. Try again later.");
      }
    } catch (error) {
      Alert.alert("❌ Error sending message:", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require("../assets/images/me.jpg")} // Replace with your photo
          style={styles.profileImage}
        />
        <Text style={styles.name}>Md Hasan Zaker</Text>

        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://www.linkedin.com/in/md-hasan-zaker-30000829a/ "
              )
            }
          >
            <FontAwesome name="linkedin-square" size={36} color="#0077b5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://www.facebook.com/HasanBinZaker")
            }
          >
            <FontAwesome name="facebook-square" size={36} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://github.com/HasanBinZaker99")
            }
          >
            <FontAwesome name="github-square" size={36} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://hasanzaker.com/")}
          >
            <FontAwesome name="globe" size={36} color="#000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>💬 Leave a Comment:</Text>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Type your comment..."
          style={styles.input}
          multiline
        />
        <Button title="Send" onPress={handleSend} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    gap: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },
});
