import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find()
      .select('name points streak badges totalStudySeconds avatar')
      .sort({ points: -1 })
      .limit(50);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;