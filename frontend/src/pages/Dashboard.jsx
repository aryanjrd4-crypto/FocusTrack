import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { BookOpen, Play, Trophy, Flame, LogOut, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#64748b'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, summaryRes, streakRes] = await Promise.all([
          API.get('/user/me'),
          API.get('/activity/summary?days=7'),
          API.get('/activity/summary?days=30')
        ]);
        setUser(userRes.data);
        setData(summaryRes.data);
        setStreakData(streakRes.data);
      } catch (err) {
        console.error(err);
        // Agar backend nahi chal raha to demo data dikhao
        setUser({
          name: 'Aryan',
          points: 0,
          streak: 0,
          badges: []
        });
        setData({
          byCategory: { study: 0, entertainment: 0, work: 0, social: 0, other: 0 },
          byDay: {},
          totalStudy: 0,
          totalEntertainment: 0,
          points: 0,
          streak: 0,
          badges: []
        });
        setStreakData({ byDay: {} });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const pieData = Object.entries(data?.byCategory || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((value || 0) / 60)
  })).filter(item => item.value > 0);

  // Agar koi data nahi hai to demo dikhao
  if (pieData.length === 0) {
    pieData.push(
      { name: 'Study', value: 0 },
      { name: 'Entertainment', value: 0 }
    );
  }

  const barData = Object.entries(data?.byDay || {}).map(([date, v]) => ({
    date: date.slice(5),
    study: Math.round((v.study || 0) / 60),
    entertainment: Math.round((v.entertainment || 0) / 60),
    other: Math.round(((v.work || 0) + (v.social || 0) + (v.other || 0)) / 60)
  }));

  // Agar bar data khali hai to last 7 din ka empty data
  if (barData.length === 0) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      barData.push({
        date: d.toISOString().slice(5, 10),
        study: 0,
        entertainment: 0
      });
    }
  }

  const studyHours = Math.floor((data?.totalStudy || 0) / 3600);
  const studyMins = Math.floor(((data?.totalStudy || 0) % 3600) / 60);
  const entHours = Math.floor((data?.totalEntertainment || 0) / 3600);
  const streakDays = Object.entries(streakData?.byDay || {}).map(([date, values]) => ({
    date,
    seconds: Object.values(values).reduce((total, seconds) => total + seconds, 0)
  }));
  const maxStreakSeconds = Math.max(...streakDays.map(day => day.seconds), 1);
  const heatClasses = [
    'bg-white/5 border-white/10',
    'bg-teal-500/25 border-teal-500/20',
    'bg-teal-500/45 border-teal-500/30',
    'bg-teal-500/70 border-teal-500/50',
    'bg-teal-400 border-teal-300'
  ];
  const getHeatClass = (seconds) => {
    if (!seconds) return heatClasses[0];
    const intensity = Math.min(4, Math.ceil((seconds / maxStreakSeconds) * 4));
    return heatClasses[intensity];
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
            FocusTrack
          </h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name || 'User'}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#12121a] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
            <Trophy className="text-yellow-400" size={18} />
            <span className="font-semibold">{user?.points || 0} pts</span>
          </div>
          <div className="bg-[#12121a] border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
            <Flame className="text-orange-400" size={18} />
            <span>{user?.streak || 0} day streak</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-500/20 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: BookOpen,
            label: 'Total Study',
            value: `${studyHours}h ${studyMins}m`,
            color: 'from-indigo-500 to-indigo-600'
          },
          {
            icon: Play,
            label: 'Entertainment',
            value: `${entHours}h`,
            color: 'from-pink-500 to-pink-600'
          },
          {
            icon: Clock,
            label: 'Today Focus',
            value: `${Math.round((data?.byDay?.[new Date().toISOString().slice(0, 10)]?.study || 0) / 60)}m`,
            color: 'from-teal-500 to-teal-600'
          },
          {
            icon: Trophy,
            label: 'Badges',
            value: user?.badges?.length || 0,
            color: 'from-amber-500 to-amber-600'
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#12121a] border border-white/10 rounded-2xl p-5"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} className="text-white" />
            </div>
            <p className="text-slate-400 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Streak heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Focus streak</h3>
            <p className="text-sm text-slate-400 mt-1">
              {user?.streak || 0} day current streak
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="text-teal-300 hover:text-teal-200 font-medium transition"
            >
              Open detailed analysis
            </button>
            <div className="flex items-center gap-2">
              <span>Less</span>
              {heatClasses.map((heatClass) => (
                <span key={heatClass} className={`w-3 h-3 rounded-sm border ${heatClass}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 sm:grid-cols-10 md:grid-cols-[repeat(15,minmax(0,1fr))] gap-2">
          {streakDays.map((day) => (
            <button
              key={day.date}
              type="button"
              onClick={() => navigate(`/progress?date=${day.date}`)}
              title={`${day.date}: ${Math.round(day.seconds / 60)} minutes`}
              aria-label={`${day.date}: ${Math.round(day.seconds / 60)} minutes. Open daily analysis.`}
              className={`aspect-square rounded-md border ${getHeatClass(day.seconds)} hover:ring-2 hover:ring-white/70 transition`}
            />
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#12121a] border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Category Breakdown (minutes)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, value }) => `${name}: ${value}m`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#12121a] border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1e2e',
                  border: '1px solid #333',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="study" name="Study" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="entertainment" name="Entertainment" fill="#ec4899" radius={[4, 4, 0, 0]} />
              <Bar dataKey="other" name="Other" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Badges Section */}
      {user?.badges?.length > 0 && (
        <div className="mt-8 bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {user.badges.map((badge, i) => (
              <span
                key={i}
                className="bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-full text-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate('/leaderboard')}
          className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition"
        >
          View Leaderboard
        </button>
      </div>
    </div>
  );
}