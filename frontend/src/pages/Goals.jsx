import { useEffect, useState } from 'react';
import { Target, Clock3, Trophy, Zap } from 'lucide-react';
import API from '../api';

export default function Goals() {
  const [goal, setGoal] = useState({ dailyMinutes: 120, weeklyMinutes: 840, focusModeEnabled: false, goals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const res = await API.get('/goals');
        setGoal(res.data);
      } catch (err) {
        setGoal({ dailyMinutes: 120, weeklyMinutes: 840, focusModeEnabled: false, goals: [] });
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  const handleSave = async () => {
    try {
      await API.post('/goals', goal);
    } catch (err) {
      console.error('Goal save failed', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-300">Loading goals...</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Focus system</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Goals & Targets</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="flex items-center gap-3">
            <Target className="text-indigo-300" />
            <h2 className="text-xl font-semibold text-white">Daily goal</h2>
          </div>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Study minutes per day</span>
              <input
                type="number"
                value={goal.dailyMinutes}
                onChange={(e) => setGoal({ ...goal, dailyMinutes: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Study minutes per week</span>
              <input
                type="number"
                value={goal.weeklyMinutes}
                onChange={(e) => setGoal({ ...goal, weeklyMinutes: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/70 p-3 text-sm text-slate-200">
              <span className="flex items-center gap-2"><Zap size={16} /> Focus mode enabled</span>
              <input
                type="checkbox"
                checked={goal.focusModeEnabled}
                onChange={(e) => setGoal({ ...goal, focusModeEnabled: e.target.checked })}
                className="h-4 w-4 accent-indigo-500"
              />
            </label>

            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-95"
            >
              Save goals
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-300" />
            <h2 className="text-xl font-semibold text-white">Current progress</h2>
          </div>

          <div className="mt-6 space-y-6">
            <ProgressRow title="Daily focus" value={58} goal={goal.dailyMinutes / 60} suffix="hrs" />
            <ProgressRow title="Weekly focus" value={72} goal={goal.weeklyMinutes / 60} suffix="hrs" />
            <ProgressRow title="Deep work" value={40} goal={5} suffix="sessions" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ title, value, goal, suffix }) {
  const safeGoal = Math.max(goal || 1, 1);
  const percent = Math.min((value / safeGoal) * 100, 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-200">{title}</span>
        <span className="text-slate-400">{value}/{safeGoal} {suffix}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
