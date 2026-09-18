import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Progress from './pages/Progress';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import API from './api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />

        <Route
          path="/"
          element={
            isLoggedIn ? (
              <AppShell setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="goals" element={<Goals />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="progress" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function AppShell({ setIsLoggedIn }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/user/me');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#050b16] text-white">
      <div className="flex min-h-screen">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-hidden">
          <div className="mx-auto max-w-7xl" style={{ minHeight: '100vh' }}>
            <div className="rounded-none border-b border-white/10 bg-[#0a1020]/80 px-4 py-4 backdrop-blur-xl lg:hidden">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-white">FocusTrack</div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="p-2 md:p-4">
              <div className="rounded-3xl border border-white/10 bg-[#0b1120]/60 p-2 shadow-[0_20px_80px_rgba(15,23,42,0.75)] backdrop-blur-xl md:p-4">
                <div className="min-h-[calc(100vh-7rem)] rounded-[1.5rem] bg-[#08101d]">
                  <div className="h-full w-full">
                    <Routes>
                      <Route index element={<Dashboard />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="leaderboard" element={<Leaderboard />} />
                      <Route path="goals" element={<Goals />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="progress" element={<Progress />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;