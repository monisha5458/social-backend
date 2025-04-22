// Only import Post once
const Post = require('../models/Post');
const User = require('../models/User');
const transporter = require('../config/nodemailer');

// Create Post
exports.createPost = async (req, res) => {
  const { id: userId } = req.user;
  const { content } = req.body;
  const mediaUrl = req.file?.path;

  if (!content) {
    return res.status(400).json({ msg: "Content is required." });
  }

  try {
    const post = await Post.create({
      author: userId,
      content,
      mediaUrl,
    });

    console.log("User ID:", userId);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found." });

    user.posts.push(post._id);
    await user.save();

    const followers = await User.find({ _id: { $in: user.followers } });
    const emailPromises = followers.map(follower => {
      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: follower.email,
        subject: `${user.username} posted something new!`,
        text: `${user.username} posted: "${content}". Check it out!`,
      });
    });

    await Promise.all(emailPromises);

    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ msg: "Error creating post.", error: err.message });
  }
};

// Like a Post
exports.likePost = async (req, res) => {
  const { id: userId } = req.user;
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();
    }

    res.json({ msg: "Post liked!" });
  } catch (err) {
    console.error("Error liking post:", err);
    res.status(500).json({ msg: "Error liking post.", error: err.message });
  }
};

// Get Feed
exports.getFeed = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const posts = await Post.find({ author: { $in: user.following } })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Error getting feed:", err);
    res.status(500).json({ msg: "Error getting feed.", error: err.message });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findByIdAndDelete(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


// Get all posts
exports.getAllPosts = async (req, res) => {
  
  const { id: userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const posts = await Post.find({ author: user })

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error getting all posts:", err);
    res.status(500).json({ msg: "Error getting posts.", error: err.message });
  }
};
