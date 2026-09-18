import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Trophy, Medal, ArrowLeft, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, meRes] = await Promise.all([
          API.get('/leaderboard'),
          API.get('/user/me')
        ]);
        setUsers(leaderboardRes.data || []);
        setCurrentUser(meRes.data);
      } catch (err) {
        console.error(err);
        // Demo data agar backend nahi chal raha
        setUsers([
          { name: 'Aryan', points: 0, streak: 0, badges: [] }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="text-yellow-400" size={22} />;
    if (index === 1) return <Medal className="text-gray-300" size={22} />;
    if (index === 2) return <Medal className="text-amber-600" size={22} />;
    return <span className="text-slate-500 font-bold w-6 text-center">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="bg-[#12121a] border border-white/10 p-2 rounded-xl hover:bg-white/5 transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Top focused users</p>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          {users.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No users yet. Be the first!
            </div>
          ) : (
            users.map((user, index) => {
              const isCurrentUser = currentUser && user._id === currentUser._id;

              return (
                <motion.div
                  key={user._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 md:p-5 border-b border-white/5 last:border-0 ${
                    isCurrentUser ? 'bg-indigo-500/10' : 'hover:bg-white/5'
                  } transition`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">
                      {getRankIcon(index)}
                    </div>

                    <div>
                      <p className={`font-semibold ${isCurrentUser ? 'text-indigo-300' : ''}`}>
                        {user.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Flame size={14} className="text-orange-400" />
                          {user.streak || 0} day streak
                        </span>
                        {user.badges?.length > 0 && (
                          <span>{user.badges.length} badges</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-400">
                      {user.points || 0}
                    </p>
                    <p className="text-xs text-slate-500">points</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}