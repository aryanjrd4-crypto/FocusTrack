import { useEffect, useMemo, useState } from 'react';
import API from '../api';
import { BarChart3, Flame, TrendingUp, Clock3, Globe, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#38bdf8'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get('/activity/analytics?days=30');
        setData(res.data);
      } catch (err) {
        setData({
          heatmap: [],
          hourly: Array.from({ length: 24 }, (_, hour) => ({ hour, seconds: 0 })),
          topDomains: [],
          ratioData: [],
          weekly: [],
          totalSessions: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const pieData = useMemo(() => {
    const totals = data?.ratioData?.reduce(
      (acc, item) => {
        acc.study += item.study || 0;
        acc.entertainment += item.entertainment || 0;
        return acc;
      },
      { study: 0, entertainment: 0 }
    );

    return [
      { name: 'Study', value: totals.study / 60 },
      { name: 'Entertainment', value: totals.entertainment / 60 }
    ].filter(item => item.value > 0);
  }, [data]);

  if (loading) {
    return <div className="p-8 text-slate-300">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Insights</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Analytics</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Clock3} label="Total sessions" value={String(data?.totalSessions || 0)} tone="indigo" />
        <MetricCard icon={Flame} label="Top streak" value="2 days" tone="amber" />
        <MetricCard icon={TrendingUp} label="Study minutes" value={String(Math.round(((data?.ratioData || []).reduce((total, item) => total + (item.study || 0), 0)) / 60))} tone="teal" />
        <MetricCard icon={Globe} label="Top domain" value={data?.topDomains?.[0]?.domain || 'N/A'} tone="pink" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl shadow-slate-950/30">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Study vs Entertainment</h2>
            <Sparkles className="text-indigo-300" size={18} />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.ratioData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="study" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="entertainment" fill="#f472b6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl shadow-slate-950/30">
          <h2 className="mb-4 text-lg font-semibold text-white">Category split</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry, idx) => (
                    <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl shadow-slate-950/30">
          <h2 className="mb-4 text-lg font-semibold text-white">Top domains</h2>
          <div className="space-y-3">
            {(data?.topDomains || []).map((item, index) => (
              <div key={item.domain} className="flex items-center justify-between rounded-xl bg-slate-900/80 px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/20 text-xs text-indigo-200">{index + 1}</span>
                  <span className="text-slate-200">{item.domain}</span>
                </div>
                <span className="text-sm text-slate-300">{Math.round(item.seconds / 60)}m</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-2xl shadow-slate-950/30">
          <h2 className="mb-4 text-lg font-semibold text-white">Hourly focus</h2>
          <div className="space-y-2">
            {(data?.hourly || []).map((item) => (
              <div key={item.hour} className="grid grid-cols-[42px_1fr_50px] items-center gap-2 text-sm">
                <span className="text-slate-400">{String(item.hour).padStart(2, '0')}:00</span>
                <div className="h-2.5 rounded-full bg-slate-800">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500"
                    style={{ width: `${Math.min((item.seconds / 3600) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-right text-slate-300">{Math.round(item.seconds / 60)}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone }) {
  const styleMap = {
    indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-200',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    teal: 'border-teal-500/30 bg-teal-500/10 text-teal-200',
    pink: 'border-pink-500/30 bg-pink-500/10 text-pink-200'
  };

  return (
    <div className={`rounded-2xl border p-4 ${styleMap[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">{label}</p>
        <Icon size={18} />
      </div>
      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
