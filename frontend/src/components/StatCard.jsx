import { motion } from 'framer-motion';

export default function StatCard({ label, value, icon: Icon, tone = 'indigo' }) {
  const toneClass = {
    indigo: 'from-indigo-500/30 to-indigo-500/10 text-indigo-200 border-indigo-500/30',
    pink: 'from-pink-500/30 to-pink-500/10 text-pink-200 border-pink-500/30',
    teal: 'from-teal-500/30 to-teal-500/10 text-teal-200 border-teal-500/30',
    amber: 'from-amber-500/30 to-amber-500/10 text-amber-200 border-amber-500/30',
    rose: 'from-rose-500/30 to-rose-500/10 text-rose-200 border-rose-500/30'
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-gradient-to-br ${toneClass} p-4 shadow-lg shadow-slate-950/20`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-950/30">
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </motion.div>
  );
}
