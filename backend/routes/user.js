import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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