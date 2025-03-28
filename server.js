const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
// const bcrypt = require("bcrypt"); ❌
const bcrypt = require("bcryptjs"); // ✅

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const uri =
  "mongodb+srv://mdhbz99d:plyPbyF3GGqBFKw4@cluster0.c1urh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define User Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  workouts: [String],
});

const User = mongoose.model("User", userSchema);

// Define Mongoose Schema & Model
const inputSchema = new mongoose.Schema({ text: String });
const Input = mongoose.model("Input", inputSchema);

// ✅ Wait for DB connection before handling login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ✅ Compare hashed password with user input
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const workoutOptionSchema = new mongoose.Schema({
  email: String,
  workouts: [String],
});

const WorkoutOption = mongoose.model("WorkoutOption", workoutOptionSchema);

// Create Workout

app.post("/create-workoutOptions", async (req, res) => {
  console.log("hello");
  const { email, workouts } = req.body;

  if (!email || !Array.isArray(workouts)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    // 🧼 Either update or create new
    const existing = await WorkoutOption.findOne({ email });

    if (existing) {
      existing.workouts = workouts;
      await existing.save();
      return res.status(200).json({ message: "Workout options updated!" });
    }

    // Or create new
    await WorkoutOption.create({ email, workouts });
    res.status(201).json({ message: "Workout options created!" });
  } catch (err) {
    console.error("❌ Failed to save workout options:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 3000; // Render sets process.env.PORT automatically
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
app.get("/", (req, res) => {
  res.send("✅ Server is alive!");
});
