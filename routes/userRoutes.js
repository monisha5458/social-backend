const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { followUser, unfollowUser } = require("../controllers/userController");

router.put("/follow/:id", auth, followUser);
router.put("/unfollow/:id", auth, unfollowUser);

module.exports = router;
