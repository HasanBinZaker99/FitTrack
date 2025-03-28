import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

const { height: screenHeight } = Dimensions.get("window");
export default function Home() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../assets/images/Khabib.jpg")}
        style={[styles.khabibImage, { height: screenHeight * 0.5 }]}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/create-workout")}
      >
        <Text> Create Workout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/workout-options")}
      >
        <Text> Workout Options</Text>
      </TouchableOpacity>
      <Button title="Logout" onPress={() => router.push("/")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
  },
  khabibImage: {
    width: "100%",
  },
  welcomeText: {
    fontSize: 24,
    marginVertical: 20,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
