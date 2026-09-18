import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Trophy,
  Target,
  User,
  Settings,
  LogOut
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { label: 'Goals', path: '/goals', icon: Target },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings }
];

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="hidden lg:flex lg:w-72 xl:w-80 min-h-screen flex-col border-r border-white/10 bg-[#0b1020]/80 backdrop-blur-xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 font-bold text-white shadow-lg shadow-indigo-500/30">
            F
          </div>
          <div>
            <p className="text-lg font-semibold text-white">FocusTrack</p>
            <p className="text-xs text-slate-400">Premium Focus OS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ label, path, icon: Icon }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-200 shadow-inner shadow-indigo-500/20'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || 'User avatar'}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-slate-950">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400">{user?.points || 0} pts</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm font-medium text-red-300 transition hover:bg-red-500/15"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
