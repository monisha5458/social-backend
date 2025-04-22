const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getProfile,followUser, unfollowUser } = require("../controllers/userController");

router.put("/follow/:id", auth, followUser);
router.put("/unfollow/:id", auth, unfollowUser);
router.get("/profile", auth, getProfile);
module.exports = router;
