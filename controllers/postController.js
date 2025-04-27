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
    res.status(500).json({ message: 'Server error', error: JSON.stringify(err) });
  }
};

// Like a Post
exports.likePost = async (req, res) => {
  const { id: userId } = req.user;
  const { id: postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
    } else {
      // Unlike the post if already liked
      post.likes = post.likes.filter(like => like.toString() !== userId);
    }

    await post.save();
    res.json({ msg: post.likes.includes(userId) ? "Post liked!" : "Post unliked!" });
  } catch (err) {
    console.error("Error liking/unliking post:", err);
    res.status(500).json({ msg: "Error processing like.", error: err.message });
  }
};

exports.unlikePost = async (req, res) => {
  const { id: userId } = req.user;
  const { id: postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    post.likes = post.likes.filter(like => like.toString() !== userId);
    await post.save();

    res.json({ msg: "Post unliked!" });
  } catch (err) {
    res.status(500).json({ msg: "Error unliking post", error: err.message });
  }
};


// Get Feed (Posts from users you follow)
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

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ensure the user deleting the post is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    // Remove the post from the user's posts array
    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: postId }
    });

    // Delete the post
    await post.deleteOne();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Get all posts by the user and their followers
exports.getAllPosts = async (req, res) => {
  const { id: userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Fetch posts from the user and their followers
    const posts = await Post.find({
      $or: [
        { author: userId },
        { author: { $in: user.following } }
      ]
    })
      .populate("author", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error getting all posts:", err);
    res.status(500).json({ msg: "Error getting posts.", error: err.message });
  }
};


exports.getLikes = async (req, res) => {
  const { id: userId } = req.user;
  const { id: postId } = req.params;
  try {
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const numberOfLikes = post.likes.length;

    return res.status(200).json({likes: numberOfLikes});
  } catch (err) {  
    console.error("Error getting all posts:", err);
    res.status(500).json(err.message);
  }
}