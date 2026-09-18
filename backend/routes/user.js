import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    points: req.user.points,
    streak: req.user.streak,
    badges: req.user.badges || [],
    avatar: req.user.avatar || '',
    theme: req.user.theme || 'dark',
    notifications: req.user.notifications || {
      email: true,
      weeklyReport: true,
      goalReminders: true
    },
    dailyGoalMinutes: req.user.dailyGoalMinutes || 120,
    weeklyGoalMinutes: req.user.weeklyGoalMinutes || 840,
    totalStudySeconds: req.user.totalStudySeconds || 0,
    totalEntertainmentSeconds: req.user.totalEntertainmentSeconds || 0
  });
});

router.patch('/me', protect, async (req, res) => {
  try {
    const { name, avatar, theme, notifications } = req.body || {};
    const user = req.user;

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof avatar === 'string') user.avatar = avatar;
    if (theme === 'dark' || theme === 'light') user.theme = theme;
    if (notifications && typeof notifications === 'object') {
      user.notifications = {
        ...user.notifications,
        ...notifications
      };
    }

    await user.save();
    res.json({
      message: 'Profile updated',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        theme: user.theme,
        notifications: user.notifications
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;