import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  MaterialIcons,
  FontAwesome5,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

export default function Index() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const compactButtonWidth = Math.min(width * 0.42, 160);
  const imageHeight = height * 0.6;
  const iconColors = ["#f94144", "#f3722c", "#f9c74f", "#43aa8b", "#577590"];

  return (
    <View style={styles.screen}>
      {/* 🖼️ Header Image */}
      <Image
        source={require("../assets/images/Khabib.jpg")}
        style={[styles.khabibImage, { height: imageHeight }]}
        resizeMode="cover"
      />

      {/* 🟦 Button Section */}
      <View style={styles.buttonSection}>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={[styles.button, { width: compactButtonWidth }]}
            onPress={() => router.push("/create-workout")}
          >
            <MaterialIcons
              name="fitness-center"
              size={20}
              color={iconColors[0]}
            />
            <Text style={styles.buttonText}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { width: compactButtonWidth }]}
            onPress={() => router.push("/workout-options")}
          >
            <FontAwesome5 name="dumbbell" size={20} color={iconColors[1]} />
            <Text style={styles.buttonText}>Options</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { width: compactButtonWidth }]}
            onPress={() => router.push("/showWorkout")}
          >
            <Feather name="activity" size={20} color={iconColors[2]} />
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { width: compactButtonWidth }]}
            onPress={() => router.push("/musicOptions")}
          >
            <MaterialCommunityIcons
              name="music"
              size={20}
              color={iconColors[4]}
            />
            <Text style={styles.buttonText}>Music</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { width: compactButtonWidth }]}
            onPress={() => router.push("/contact")}
          >
            <MaterialCommunityIcons
              name="contacts"
              size={20}
              color={iconColors[3]}
            />
            <Text style={styles.buttonText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  khabibImage: {
    width: "100%",
  },
  buttonSection: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 30,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    margin: 8,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 8,
    fontWeight: "bold",
  },
});
