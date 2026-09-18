import express from 'express';
import { protect } from '../middleware/auth.js';
import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { detectCategory, calculatePoints } from '../utils/category.js';

const router = express.Router();

// Extension se bulk data aayega
router.post('/track', protect, async (req, res) => {
  try {
    const { sessions } = req.body; // [{ domain, url, title, seconds, date }]
    if (!Array.isArray(sessions) || sessions.length === 0) {
      return res.status(400).json({ message: 'No sessions' });
    }

    let totalPointsAdded = 0;
    const user = await User.findById(req.user._id);

    for (const s of sessions) {
      const category = detectCategory(s.domain, s.url || '', s.title || '');
      const points = calculatePoints(s.seconds, category);

      await Activity.create({
        userId: req.user._id,
        domain: s.domain,
        category,
        seconds: s.seconds,
        date: s.date,
        title: s.title || ''
      });

      // Update user totals
      if (category === 'study') user.totalStudySeconds += s.seconds;
      else if (category === 'entertainment') user.totalEntertainmentSeconds += s.seconds;
      else user.totalOtherSeconds += s.seconds;

      user.points += points;
      totalPointsAdded += points;
    }

    // Streak logic
    const today = new Date().toISOString().split('T')[0];
    if (user.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yestStr = yesterday.toISOString().split('T')[0];
      if (user.lastActiveDate === yestStr) user.streak += 1;
      else user.streak = 1;
      user.lastActiveDate = today;
    }

    // Simple badges
    if (user.totalStudySeconds >= 3600 * 10 && !user.badges.includes('10hr Scholar')) {
      user.badges.push('10hr Scholar');
    }
    if (user.streak >= 7 && !user.badges.includes('7 Day Streak')) {
      user.badges.push('7 Day Streak');
    }

    await user.save();
    res.json({ message: 'Tracked', pointsAdded: totalPointsAdded, totalPoints: user.points });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/daily', protect, async (req, res) => {
  try {
    const date = String(req.query.date || new Date().toISOString().split('T')[0]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const activities = await Activity.find({ userId: req.user._id, date })
      .sort({ createdAt: -1 })
      .lean();

    const byCategory = { study: 0, entertainment: 0, work: 0, social: 0, other: 0 };
    const byDomain = {};
    let totalSeconds = 0;

    activities.forEach(activity => {
      totalSeconds += activity.seconds;
      byCategory[activity.category] += activity.seconds;
      byDomain[activity.domain] = (byDomain[activity.domain] || 0) + activity.seconds;
    });

    const topDomains = Object.entries(byDomain)
      .sort(([, firstSeconds], [, secondSeconds]) => secondSeconds - firstSeconds)
      .slice(0, 8)
      .map(([domain, seconds]) => ({ domain, seconds }));

    res.json({ date, totalSeconds, byCategory, topDomains, activities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dashboard ke liye summary
router.get('/summary', protect, async (req, res) => {
  try {
    const requestedDays = Number(req.query.days) || 7;
    const days = Math.min(Math.max(Math.floor(requestedDays), 1), 30);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    const startStr = startDate.toISOString().split('T')[0];

    const activities = await Activity.find({
      userId: req.user._id,
      date: { $gte: startStr }
    });

    const byCategory = { study: 0, entertainment: 0, work: 0, social: 0, other: 0 };
    const byDay = {};

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(startDate);
      date.setUTCDate(startDate.getUTCDate() + offset);
      byDay[date.toISOString().split('T')[0]] = {
        study: 0,
        entertainment: 0,
        work: 0,
        social: 0,
        other: 0
      };
    }

    activities.forEach(a => {
      byCategory[a.category] = (byCategory[a.category] || 0) + a.seconds;
      if (!byDay[a.date]) return;
      byDay[a.date][a.category] += a.seconds;
    });

    res.json({
      byCategory,
      byDay,
      totalStudy: req.user.totalStudySeconds,
      totalEntertainment: req.user.totalEntertainmentSeconds,
      points: req.user.points,
      streak: req.user.streak,
      badges: req.user.badges
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/analytics', protect, async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startStr = startDate.toISOString().split('T')[0];

    const activities = await Activity.find({
      userId: req.user._id,
      date: { $gte: startStr }
    }).lean();

    const heatmap = [];
    const hourly = Array.from({ length: 24 }, (_, hour) => ({ hour, seconds: 0 }));
    const domainMap = {};
    const ratioData = [];

    for (let i = 0; i < days; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      heatmap.push({ date: dateStr, totalSeconds: 0 });
    }

    activities.forEach((activity) => {
      const heatIndex = heatmap.findIndex(item => item.date === activity.date);
      if (heatIndex >= 0) {
        heatmap[heatIndex].totalSeconds += activity.seconds;
      }

      const hour = new Date(activity.createdAt).getHours();
      if (hourly[hour]) {
        hourly[hour].seconds += activity.seconds;
      }

      const domain = activity.domain || 'unknown';
      domainMap[domain] = (domainMap[domain] || 0) + activity.seconds;
    });

    for (let i = 0; i < heatmap.length; i += 1) {
      const item = heatmap[i];
      const date = new Date(item.date);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ratioData.push({
        date: label,
        study: activities.filter(activity => activity.date === item.date && activity.category === 'study').reduce((total, activity) => total + activity.seconds, 0),
        entertainment: activities.filter(activity => activity.date === item.date && activity.category === 'entertainment').reduce((total, activity) => total + activity.seconds, 0)
      });
    }

    const topDomains = Object.entries(domainMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([domain, seconds]) => ({ domain, seconds }));

    const weekly = [];
    const totalsByWeek = {};
    activities.forEach((activity) => {
      const d = new Date(activity.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      totalsByWeek[key] = (totalsByWeek[key] || 0) + activity.seconds;
    });

    Object.entries(totalsByWeek).forEach(([week, seconds]) => {
      weekly.push({ week, minutes: Math.round(seconds / 60) });
    });

    res.json({
      heatmap,
      hourly,
      topDomains,
      ratioData,
      weekly: weekly.slice(-8),
      totalSessions: activities.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;