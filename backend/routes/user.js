import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { protect } from '../middleware/auth.js';
import Activity from '../models/Activity.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const getNotificationPreferences = (user) => ({
  emailNotifications: user.emailNotifications ?? user.notifications?.email ?? true,
  weeklyReport: user.weeklyReport ?? user.notifications?.weeklyReport ?? true
});

const serializeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  emailNotifications: getNotificationPreferences(user).emailNotifications,
  weeklyReport: getNotificationPreferences(user).weeklyReport,
  notifications: user.notifications || {
    email: getNotificationPreferences(user).emailNotifications,
    weeklyReport: getNotificationPreferences(user).weeklyReport,
    goalReminders: true
  },
  points: user.points,
  streak: user.streak,
  badges: user.badges || [],
  theme: user.theme || 'dark',
  dailyGoalMinutes: user.dailyGoalMinutes || 120,
  weeklyGoalMinutes: user.weeklyGoalMinutes || 840,
  totalStudySeconds: user.totalStudySeconds || 0,
  totalEntertainmentSeconds: user.totalEntertainmentSeconds || 0
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get('/me', protect, async (req, res) => {
  res.json(serializeUser(req.user));
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    req.user.name = name.trim();
    if (typeof avatar === 'string') req.user.avatar = avatar.trim();
    await req.user.save();

    res.json({ message: 'Profile updated successfully', user: serializeUser(req.user) });
  } catch (err) {
    res.status(500).json({ message: 'Unable to update profile' });
  }
});

router.put('/notifications', protect, async (req, res) => {
  try {
    const { emailNotifications, weeklyReport } = req.body || {};

    if (typeof emailNotifications !== 'boolean' || typeof weeklyReport !== 'boolean') {
      return res.status(400).json({ message: 'Notification preferences must be boolean values' });
    }

    req.user.emailNotifications = emailNotifications;
    req.user.weeklyReport = weeklyReport;
    req.user.notifications = {
      ...req.user.notifications,
      email: emailNotifications,
      weeklyReport
    };
    await req.user.save();

    res.json({ message: 'Notification preferences updated', emailNotifications, weeklyReport });
  } catch (err) {
    res.status(500).json({ message: 'Unable to update notification preferences' });
  }
});

router.get('/export', protect, async (req, res) => {
  try {
    const activities = await Activity.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .select('-__v')
      .lean();

    res.json({
      exportedAt: new Date().toISOString(),
      user: { name: req.user.name, email: req.user.email },
      activities
    });
  } catch (err) {
    res.status(500).json({ message: 'Unable to export activity data' });
  }
});

router.delete('/account', protect, async (req, res) => {
  try {
    await Activity.deleteMany({ userId: req.user._id });
    await req.user.deleteOne();
    res.json({ message: 'Account and activity data deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Unable to delete account' });
  }
});

router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    let avatarUrl = '';

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.v2.uploader.upload_stream(
          {
            folder: 'focustrack/avatars',
            transformation: [{ width: 512, height: 512, crop: 'fill', quality: 'auto' }]
          },
          (error, uploaded) => {
            if (error) return reject(error);
            resolve(uploaded);
          }
        );

        stream.end(req.file.buffer);
      });

      avatarUrl = result.secure_url;
    } else {
      avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    req.user.avatar = avatarUrl;
    await req.user.save();

    res.json({ message: 'Avatar uploaded', avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Avatar upload failed' });
  }
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
      if (typeof notifications.email === 'boolean') user.emailNotifications = notifications.email;
      if (typeof notifications.weeklyReport === 'boolean') user.weeklyReport = notifications.weeklyReport;
    }

    await user.save();
    res.json({
      message: 'Profile updated',
      user: serializeUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;