const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getProfile,followUser, unfollowUser, searchUsers  } = require("../controllers/userController");

router.put("/follow/:id", auth, followUser);
router.put("/unfollow/:id", auth, unfollowUser);
router.get("/profile", auth, getProfile);
router.get("/search", auth, searchUsers);
module.exports = router;
