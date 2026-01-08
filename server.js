const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config(); // optional if you want local .env

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

// Allow only your GitHub Pages frontend
app.use(cors({
  origin: ["https://jebamujawar.github.io/blog-frontend"], // Replace with your actual GitHub Pages URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));


app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGO_URI; // Set in Render dashboard or local .env
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
