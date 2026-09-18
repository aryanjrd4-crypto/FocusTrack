import { useState } from 'react';
import { Settings as SettingsIcon, Moon, ShieldCheck, Download, BellRing } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    analytics: true,
    sounds: false,
    privacyMode: false
  });

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">Preferences</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Settings</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="mb-4 flex items-center gap-3">
            <SettingsIcon className="text-indigo-300" />
            <h2 className="text-xl font-semibold text-white">General</h2>
          </div>
          <div className="space-y-4">
            <SettingToggle label="Dark mode" icon={Moon} enabled={settings.theme === 'dark'} />
            <SettingToggle label="Privacy mode" icon={ShieldCheck} enabled={settings.privacyMode} />
            <SettingToggle label="Sound notifications" icon={BellRing} enabled={settings.sounds} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Download className="text-cyan-300" />
            <h2 className="text-xl font-semibold text-white">Data controls</h2>
          </div>
          <div className="space-y-4">
            <button type="button" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-slate-200 hover:bg-slate-900">Export CSV</button>
            <button type="button" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-slate-200 hover:bg-slate-900">Export PDF</button>
            <button type="button" className="w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-slate-200 hover:bg-slate-900">Sync manual data</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, icon: Icon, enabled }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-200">
          <Icon size={16} />
        </span>
        <span className="text-slate-200">{label}</span>
      </div>
      <input type="checkbox" checked={enabled} readOnly className="h-4 w-4 accent-indigo-500" />
    </div>
  );
}
