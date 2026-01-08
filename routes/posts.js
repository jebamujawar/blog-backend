const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}


// Middleware: Auth
function auth(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Malformed token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}



// -------------------------
// GET all posts (public)
// -------------------------
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// CREATE post (protected)
// -------------------------
router.post("/", auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content required" });

  try {
    const post = await Post.create({ title, content, author: req.userId });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// UPDATE post (protected)
// -------------------------
router.put("/:id", auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: "Title and content required" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

    post.title = title;
    post.content = content;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// DELETE post (protected)
// -------------------------
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.author.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
