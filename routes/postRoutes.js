const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createPost,
  likePost,
  getFeed,
  deletePost,  // Import deletePost from postController
} = require("../controllers/postController");

router.post("/create", auth, upload.single("media"), createPost);
router.put("/like/:postId", auth, likePost);
router.get("/feed", auth, getFeed);
// Delete a post route
router.delete('/:id', auth, deletePost);  // Use deletePost

module.exports = router;
