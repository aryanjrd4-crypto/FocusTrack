import { useEffect, useState } from 'react';
import API from '../api';
import { UserCircle2, Save, Bell, Download, Trash2 } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get('/user/me');
        setUser(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      await API.patch('/user/me', user);
    } catch (err) {
      console.error('Profile save failed', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-slate-300">Loading profile...</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Account</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-2xl font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
          <div className="mt-5 text-center">
            <h2 className="text-2xl font-semibold text-white">{user?.name || 'User'}</h2>
            <p className="text-slate-400">{user?.email || 'No email'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Name</span>
              <input
                value={user?.name || ''}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Avatar URL</span>
              <input
                value={user?.avatar || ''}
                onChange={(e) => setUser({ ...user, avatar: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <button type="button" onClick={handleSave} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-medium text-white hover:bg-indigo-400">
                <Save size={16} /> Save profile
              </button>
              <button type="button" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 font-medium text-slate-200 hover:bg-slate-900">
                <Download size={16} /> Export data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Bell className="text-cyan-300" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-3 text-sm text-slate-200">
            <ToggleRow label="Email updates" enabled={user?.notifications?.email ?? true} />
            <ToggleRow label="Weekly report" enabled={user?.notifications?.weeklyReport ?? true} />
            <ToggleRow label="Goal reminders" enabled={user?.notifications?.goalReminders ?? true} />
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Trash2 className="text-red-300" />
            <h3 className="text-lg font-semibold text-white">Danger zone</h3>
          </div>
          <p className="mb-4 text-sm text-slate-300">This will permanently delete your account and all tracked data.</p>
          <button type="button" className="rounded-xl bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-400">
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, enabled }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5">
      <span>{label}</span>
      <input type="checkbox" checked={enabled} readOnly className="h-4 w-4 accent-indigo-500" />
    </div>
  );
}
