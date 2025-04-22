const User = require("../models/User");

exports.getProfile = async (req, res) => {
  const { id : userId } = req.user;
  try {
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
}

exports.followUser = async (req, res) => {
  const { id: userId } = req.user;  // using `id` from JWT payload
  const { id: followId } = req.params;

  if (userId === followId) return res.status(400).json({ msg: "Cannot follow yourself" });

  try {
    const user = await User.findById(userId);
    const followUser = await User.findById(followId);

    if (!followUser || !user) return res.status(404).json({ msg: "User not found" });

    if (!user.following.includes(followId)) {
      user.following.push(followId);
      followUser.followers.push(userId);
      await user.save();
      await followUser.save();
    }

    res.json({ msg: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  const { id: userId } = req.user;
  const { id: unfollowId } = req.params;

  try {
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowId);

    if (!user || !unfollowUser) return res.status(404).json({ msg: "User not found" });

    user.following = user.following.filter((id) => id.toString() !== unfollowId);
    unfollowUser.followers = unfollowUser.followers.filter((id) => id.toString() !== userId);

    await user.save();
    await unfollowUser.save();

    res.json({ msg: "Unfollowed successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
