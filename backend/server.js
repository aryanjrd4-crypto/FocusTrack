import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import activityRoutes from './routes/activity.js';
import userRoutes from './routes/user.js';
import leaderboardRoutes from './routes/leaderboard.js';

dotenv.config();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://focus-track-xi.vercel.app',
  'https://focus-track-griozcarv-jangid3.vercel.app',
  'https://focustrack-e58k.onrender.com'
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return /https:\/\/.*\.vercel\.app$/i.test(origin);
};

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://focus-track-xi.vercel.app',
      'https://focus-track-griozcarv-jangid3.vercel.app',
      'https://focustrack-e58k.onrender.com'
    ];

    if (!origin || allowed.includes(origin) || /https:\/\/.*\.vercel\.app$/i.test(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.options('*', cors());


app.use('/api/auth', authRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/user', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'FocusTrack Backend is running' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error('MongoDB Error:', err));