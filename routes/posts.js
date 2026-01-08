const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "supersecretkey";

// Middleware
function auth(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Get all posts (public)
router.get("/", async (req, res) => {
  const posts = await Post.find().populate("author", "name");
  res.json(posts);
});

// Create post
router.post("/", auth, async (req, res) => {
  const { title, content } = req.body;
  const post = await Post.create({ title, content, author: req.userId });
  res.json(post);
});

// Update post
router.put("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.author.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

  post.title = req.body.title;
  post.content = req.body.content;
  await post.save();
  res.json(post);
});

// Delete post
router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.author.toString() !== req.userId) return res.status(403).json({ error: "Forbidden" });

  await post.remove();
  res.json({ message: "Post deleted" });
});

module.exports = router;
