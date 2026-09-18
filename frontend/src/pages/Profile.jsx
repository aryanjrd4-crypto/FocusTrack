import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { AlertCircle, Bell, Check, Download, Loader2, Save, Trash2, X } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreference, setSavingPreference] = useState('');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const notify = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get('/user/me');
        setUser(res.data);
      } catch (err) {
        notify('error', err.response?.data?.message || 'Unable to load your profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('error', 'Please choose an image file');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      notify('error', 'Please choose an image smaller than 4 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setUser((prev) => ({ ...prev, avatar: reader.result }));
    reader.onerror = () => notify('error', 'Unable to read that image');
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.name?.trim()) {
      notify('error', 'Name is required');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await API.put('/user/profile', { name: user.name, avatar: user.avatar || '' });
      setUser((prev) => ({ ...prev, ...res.data.user }));
      localStorage.setItem('user', JSON.stringify(res.data.user));
      notify('success', 'Profile saved successfully');
    } catch (err) {
      notify('error', err.response?.data?.message || 'Unable to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const previousValue = user[key];
    const preferences = {
      emailNotifications: key === 'emailNotifications' ? value : user.emailNotifications,
      weeklyReport: key === 'weeklyReport' ? value : user.weeklyReport,
      goalReminders: key === 'goalReminders' ? value : user.goalReminders
    };
    setUser((prev) => ({ ...prev, [key]: value }));
    setSavingPreference(key);

    try {
      const res = await API.put('/user/notifications', preferences);
      setUser((prev) => ({ ...prev, ...res.data }));
      notify('success', 'Notification settings updated');
    } catch (err) {
      setUser((prev) => ({ ...prev, [key]: previousValue }));
      notify('error', err.response?.data?.message || 'Unable to update settings');
    } finally {
      setSavingPreference('');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await API.get('/user/export');
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `focustrack-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      notify('success', 'Your data export is ready');
    } catch (err) {
      notify('error', err.response?.data?.message || 'Unable to export your data');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await API.delete('/user/account');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    } catch (err) {
      notify('error', err.response?.data?.message || 'Unable to delete account');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-300">Loading profile...</div>;

  return (
    <div className="relative space-y-8 p-4 md:p-8">
      {toast && (
        <div className={`fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl ${toast.type === 'success' ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100' : 'border-red-400/30 bg-red-500/15 text-red-100'}`}>
          {toast.type === 'success' ? <Check size={17} /> : <AlertCircle size={17} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Account</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Profile</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="flex items-center justify-center">
            {user?.avatar ? <img src={user.avatar} alt={user.name || 'User avatar'} className="h-24 w-24 rounded-full object-cover ring-2 ring-indigo-500/40" /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-2xl font-semibold text-white">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>}
          </div>
          <div className="mt-5 text-center">
            <h2 className="text-2xl font-semibold text-white">{user?.name || 'User'}</h2>
            <p className="text-slate-400">{user?.email || 'No email'}</p>
          </div>
          <div className="mt-5">
            <label className="block cursor-pointer rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/5 px-4 py-3 text-center text-sm font-medium text-indigo-200 transition hover:bg-indigo-500/10">
              Upload profile photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Name</span>
              <input value={user?.name || ''} onChange={(e) => setUser({ ...user, name: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-indigo-500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Avatar URL</span>
              <input value={user?.avatar || ''} onChange={(e) => setUser({ ...user, avatar: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-indigo-500" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <button type="button" onClick={handleSave} disabled={savingProfile} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 font-medium text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">
                {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {savingProfile ? 'Saving...' : 'Save profile'}
              </button>
              <button type="button" onClick={handleExport} disabled={exporting} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 font-medium text-slate-200 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60">
                {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} {exporting ? 'Exporting...' : 'Export data'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="mb-4 flex items-center gap-3"><Bell className="text-cyan-300" /><h3 className="text-lg font-semibold text-white">Notifications</h3></div>
          <div className="space-y-3 text-sm text-slate-200">
            <ToggleRow label="Email updates" enabled={user?.emailNotifications ?? user?.notifications?.email ?? true} loading={savingPreference === 'emailNotifications'} onChange={(value) => handlePreferenceChange('emailNotifications', value)} />
            <ToggleRow label="Weekly report" enabled={user?.weeklyReport ?? user?.notifications?.weeklyReport ?? true} loading={savingPreference === 'weeklyReport'} onChange={(value) => handlePreferenceChange('weeklyReport', value)} />
            <ToggleRow label="Goal reminders" enabled={user?.goalReminders ?? user?.notifications?.goalReminders ?? true} loading={savingPreference === 'goalReminders'} onChange={(value) => handlePreferenceChange('goalReminders', value)} />
          </div>
        </div>
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <div className="mb-4 flex items-center gap-3"><Trash2 className="text-red-300" /><h3 className="text-lg font-semibold text-white">Danger zone</h3></div>
          <p className="mb-4 text-sm text-slate-300">This will permanently delete your account and all tracked data.</p>
          <button type="button" onClick={() => setShowDeleteModal(true)} className="rounded-xl bg-red-500 px-4 py-3 font-medium text-white hover:bg-red-400">Delete account</button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-md rounded-2xl border border-red-400/20 bg-[#111827] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="delete-account-title" className="text-xl font-semibold text-white">Delete your account?</h2><p className="mt-2 text-sm leading-6 text-slate-300">This permanently removes your profile and all tracked activity. This action cannot be undone.</p></div>
              <button type="button" onClick={() => setShowDeleteModal(false)} aria-label="Close dialog" className="text-slate-400 hover:text-white"><X size={19} /></button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => setShowDeleteModal(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting} onClick={handleDeleteAccount} className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-400 disabled:opacity-60">{deleting && <Loader2 size={16} className="animate-spin" />} {deleting ? 'Deleting...' : 'Delete permanently'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, enabled, loading, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {loading && <Loader2 size={14} className="animate-spin text-indigo-300" />}
        <input type="checkbox" checked={enabled} disabled={loading} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-indigo-500" />
      </div>
    </div>
  );
}