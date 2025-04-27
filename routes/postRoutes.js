const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const verifyy = require('../middleware/auth'); 
const upload = require("../middleware/upload");
const {
  createPost,
  likePost,
  unlikePost,
  getFeed,
  deletePost,
  getAllPosts,
  getLikes,
} = require("../controllers/postController");

router.post("/create", auth, upload.single("media"), createPost);
//router.put("/like/:postId", auth, likePost);
router.put("/like/:id", verifyy, likePost);
router.put("/unlike/:id", verifyy, unlikePost);
router.get("/feed", auth, getFeed);
// Delete a post route
router.delete('/:id', auth, deletePost);  // Use deletePost
router.get('/', auth, getAllPosts);
router.get('/getLikes/:id', verifyy, getLikes);

module.exports = router;
