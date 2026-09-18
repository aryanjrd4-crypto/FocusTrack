import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BarChart3, Clock3, Globe2, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api';

const categories = [
  { key: 'study', label: 'Study', color: 'bg-indigo-400', text: 'text-indigo-300' },
  { key: 'work', label: 'Work', color: 'bg-amber-400', text: 'text-amber-300' },
  { key: 'entertainment', label: 'Entertainment', color: 'bg-pink-400', text: 'text-pink-300' },
  { key: 'social', label: 'Social', color: 'bg-teal-400', text: 'text-teal-300' },
  { key: 'other', label: 'Other', color: 'bg-slate-400', text: 'text-slate-300' }
];

const getToday = () => new Date().toISOString().slice(0, 10);

const formatDuration = (seconds = 0) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default function Progress() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || getToday());
  const [daily, setDaily] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const [dailyRes, summaryRes] = await Promise.all([
          API.get('/activity/daily', { params: { date: selectedDate } }),
          API.get('/activity/summary?days=30')
        ]);
        setDaily(dailyRes.data);
        setMonthly(summaryRes.data);
      } catch (error) {
        console.error(error);
        setDaily({ totalSeconds: 0, byCategory: {}, topDomains: [], activities: [] });
        setMonthly({ byDay: {} });
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [selectedDate]);

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    setSearchParams({ date });
  };

  const totalSeconds = daily?.totalSeconds || 0;
  const categoryTotal = Object.values(daily?.byCategory || {}).reduce((sum, value) => sum + value, 0);
  const activeDays = Object.values(monthly?.byDay || {}).filter(day =>
    Object.values(day).some(seconds => seconds > 0)
  ).length;
  const averageSeconds = activeDays ? Math.round(
    Object.values(monthly?.byDay || {}).reduce((sum, day) => (
      sum + Object.values(day).reduce((dayTotal, seconds) => dayTotal + seconds, 0)
    ), 0) / activeDays
  ) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-[#12121a] border border-white/10 p-2 rounded-xl hover:bg-white/5 transition"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-teal-300 text-sm font-medium">Focus intelligence</p>
              <h1 className="text-3xl md:text-4xl font-bold">Daily Progress</h1>
            </div>
          </div>
          <label className="text-sm text-slate-400">
            Analyze date
            <input
              type="date"
              value={selectedDate}
              max={getToday()}
              onChange={handleDateChange}
              className="block mt-2 bg-[#12121a] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-teal-400"
            />
          </label>
        </header>

        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center text-slate-400">Loading analysis...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: Clock3, label: 'Focused today', value: formatDuration(totalSeconds), color: 'text-teal-300' },
                { icon: Target, label: 'Active days / 30', value: `${activeDays}`, color: 'text-indigo-300' },
                { icon: TrendingUp, label: 'Average active day', value: formatDuration(averageSeconds), color: 'text-amber-300' }
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#12121a] border border-white/10 rounded-2xl p-5"
                >
                  <stat.icon size={20} className={stat.color} />
                  <p className="text-slate-400 text-sm mt-4">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <section className="lg:col-span-3 bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="text-teal-300" size={20} />
                  <div>
                    <h2 className="text-lg font-semibold">Category breakdown</h2>
                    <p className="text-sm text-slate-400">How your time was distributed</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {categories.map((category) => {
                    const seconds = daily?.byCategory?.[category.key] || 0;
                    const percentage = categoryTotal ? Math.round((seconds / categoryTotal) * 100) : 0;
                    return (
                      <div key={category.key}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className={category.text}>{category.label}</span>
                          <span className="text-slate-400">{formatDuration(seconds)} · {percentage}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className={`h-full rounded-full ${category.color}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="lg:col-span-2 bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Globe2 className="text-indigo-300" size={20} />
                  <div>
                    <h2 className="text-lg font-semibold">Top websites</h2>
                    <p className="text-sm text-slate-400">Most time spent today</p>
                  </div>
                </div>
                {daily?.topDomains?.length ? (
                  <div className="space-y-4">
                    {daily.topDomains.map((site, index) => (
                      <div key={site.domain} className="flex items-center gap-3">
                        <span className="text-slate-500 text-sm w-4">{index + 1}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between gap-3 text-sm mb-1">
                            <span className="truncate">{site.domain}</span>
                            <span className="text-slate-400 whitespace-nowrap">{formatDuration(site.seconds)}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-400" style={{ width: `${(site.seconds / daily.topDomains[0].seconds) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No tracked websites for this date.</p>
                )}
              </section>
            </div>

            <section className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-semibold">Session timeline</h2>
              <p className="text-sm text-slate-400 mt-1 mb-5">Every recorded browsing session for {selectedDate}</p>
              {daily?.activities?.length ? (
                <div className="divide-y divide-white/5">
                  {daily.activities.map((activity) => (
                    <div key={activity._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{activity.title || activity.domain}</p>
                        <p className="text-sm text-slate-500 truncate">{activity.domain} · {activity.category}</p>
                      </div>
                      <span className="text-teal-300 font-medium whitespace-nowrap">{formatDuration(activity.seconds)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No sessions recorded for this date.</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
