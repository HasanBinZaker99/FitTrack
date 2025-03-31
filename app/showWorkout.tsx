import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import Checkbox from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

interface WorkoutEntry {
  date: string;
  workouts: Record<string, boolean>;
}

export default function ShowWorkout() {
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [toDate, setToDate] = useState<Date>(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Helper to format Date object as "YYYY-MM-DD"
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Load last 30 days of history for display (chart and list)
  useEffect(() => {
    const loadHistory = async () => {
      const raw = await AsyncStorage.getItem("workoutHistory");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const today = new Date();
      const days: WorkoutEntry[] = [];
      const values: number[] = [];
      const labels: string[] = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const key = date.toISOString().split("T")[0];

        if (parsed[key]) {
          const workoutMap = parsed[key];
          const total = Object.keys(workoutMap).length;
          const completed = Object.values(
            workoutMap as Record<string, boolean>
          ).filter((v) => v).length;
          const percent = total > 0 ? completed / total : 0;

          days.push({ date: key, workouts: workoutMap });
          values.push(percent); // height of bar in chart
          labels.push(key.slice(5)); // use MM-DD for chart label
        }
      }

      setHistory(days);
      setChartData(values.reverse());
      setChartLabels(labels.reverse());
    };

    loadHistory();
  }, []);

  // Handle PDF export
  const handleExportPdf = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      // Ensure valid date range
      if (fromDate > toDate) {
        Alert.alert(
          "Invalid Date Range",
          "The 'From' date must be earlier than the 'To' date."
        );
        return;
      }
      const fromStr = formatDate(fromDate);
      const toStr = formatDate(toDate);

      // Fetch all stored workout history
      const raw = await AsyncStorage.getItem("workoutHistory");
      if (!raw) {
        Alert.alert("No Data", "No workout history found.");
        return;
      }
      const parsed = JSON.parse(raw);
      const allDates = Object.keys(parsed).sort();
      const filteredDates = allDates.filter(
        (date) => date >= fromStr && date <= toStr
      );
      if (filteredDates.length === 0) {
        Alert.alert(
          "No Data",
          "No workout data found in the selected date range."
        );
        return;
      }

      // Build HTML content for the PDF
      let htmlContent = "<html><head>";
      htmlContent +=
        '<meta name="viewport" content="width=device-width, initial-scale=1.0"/>';
      htmlContent += "<style>";
      htmlContent += "body { font-family: Arial, sans-serif; margin: 20px; }";
      htmlContent += "h1 { text-align: center; margin-bottom: 20px; }";
      htmlContent += "h2 { margin-top: 20px; font-size: 16px; }";
      htmlContent += "ul { list-style-type: none; padding-left: 0; }";
      htmlContent += "li { margin-bottom: 5px; }";
      htmlContent += "</style></head><body>";
      htmlContent += `<h1>Workout History from ${fromStr} to ${toStr}</h1>`;

      filteredDates.forEach((dateKey) => {
        const workoutMap = parsed[dateKey];
        const total = Object.keys(workoutMap).length;
        const completed = Object.values(workoutMap).filter((v) => v).length;
        htmlContent += `<h2>${dateKey} - ${completed}/${total} completed</h2><ul>`;
        for (const [name, done] of Object.entries(workoutMap)) {
          // Use a checkbox symbol for done vs not done
          htmlContent += `<li>${done ? "☑" : "☐"} ${name}</li>`;
        }
        htmlContent += "</ul>";
      });

      htmlContent += "</body></html>";

      // Create PDF file and share it
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const newFilePath =
        FileSystem.documentDirectory +
        `WorkoutHistory_${fromStr}_to_${toStr}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: newFilePath });
      await Sharing.shareAsync(newFilePath, {
        mimeType: "application/pdf",
        UTI: ".pdf",
        dialogTitle: "Share Workout History PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "An error occurred while generating the PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Workout History (Last 30 Days)</Text>

      {/* Date range selectors and Export button */}
      <View style={styles.exportContainer}>
        <View style={styles.dateRow}>
          <View style={styles.dateGroup}>
            <Text style={styles.dateLabel}>From:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowFromPicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(fromDate)}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.dateGroup}>
            <Text style={styles.dateLabel}>To:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowToPicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(toDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showFromPicker && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowFromPicker(false);
              if (selectedDate) {
                setFromDate(selectedDate);
                // If user picks a date after the current 'To' date, adjust 'To' as well
                if (selectedDate > toDate) {
                  setToDate(selectedDate);
                }
              }
            }}
          />
        )}
        {showToPicker && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowToPicker(false);
              if (selectedDate) {
                setToDate(selectedDate);
                // If user picks a date before the current 'From' date, adjust 'From' as well
                if (selectedDate < fromDate) {
                  setFromDate(selectedDate);
                }
              }
            }}
          />
        )}

        <TouchableOpacity
          style={[styles.exportButton, exporting && { opacity: 0.7 }]}
          onPress={handleExportPdf}
          disabled={exporting}
        >
          <Text style={styles.exportButtonText}>
            {exporting ? "Exporting PDF..." : "Export to PDF"}
          </Text>
        </TouchableOpacity>
      </View>

      {chartData.length > 0 && (
        <BarChart
          data={{
            labels: chartLabels,
            datasets: [{ data: chartData }],
          }}
          width={Dimensions.get("window").width - 30}
          height={200}
          fromZero
          yAxisLabel="" // ✅ REQUIRED
          yAxisSuffix="" // ✅ REQUIRED
          chartConfig={{
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2,
            color: () => "#000", // axis & label color
            labelColor: () => "#000",
            fillShadowGradient: "#0000FF", // solid blue bars
            fillShadowGradientOpacity: 1, // full opacity for bars
          }}
          style={{
            borderRadius: 16,
            marginBottom: 20,
          }}
          withInnerLines={false}
          withHorizontalLabels={false}
          showBarTops={false}
        />
      )}

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
    padding: 15,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 20,
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
  /* New styles for PDF export feature */
  exportContainer: {
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontWeight: "bold",
    marginRight: 5,
  },
  dateButton: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  dateButtonText: {
    fontSize: 14,
  },
  exportButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
