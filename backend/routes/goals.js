import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    res.json({
      dailyMinutes: user.dailyGoalMinutes || 120,
      weeklyMinutes: user.weeklyGoalMinutes || 840,
      focusModeEnabled: Boolean(user.focusModeEnabled),
      goals: user.goals || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { dailyMinutes, weeklyMinutes, focusModeEnabled, goals } = req.body || {};
    const user = await User.findById(req.user._id);

    user.dailyGoalMinutes = Number(dailyMinutes) || 120;
    user.weeklyGoalMinutes = Number(weeklyMinutes) || 840;
    user.focusModeEnabled = Boolean(focusModeEnabled);
    user.goals = Array.isArray(goals) ? goals.slice(0, 10) : user.goals || [];

    await user.save();
    res.json({
      dailyMinutes: user.dailyGoalMinutes,
      weeklyMinutes: user.weeklyGoalMinutes,
      focusModeEnabled: user.focusModeEnabled,
      goals: user.goals
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
