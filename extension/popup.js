const loginSection = document.getElementById('loginSection');
const statusSection = document.getElementById('statusSection');
const errorEl = document.getElementById('error');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const userEmailEl = document.getElementById('userEmail');

async function checkLogin() {
  const data = await chrome.storage.local.get(['token', 'userEmail']);
  if (data.token) {
    loginSection.classList.add('hidden');
    statusSection.classList.remove('hidden');
    userEmailEl.textContent = data.userEmail || 'User';
  } else {
    loginSection.classList.remove('hidden');
    statusSection.classList.add('hidden');
  }
}

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    errorEl.textContent = 'Email and password required';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.message || 'Login failed';
      errorEl.classList.remove('hidden');
      return;
    }

    await chrome.storage.local.set({
      token: data.token,
      userEmail: data.user?.email || data.email || email
    });

    chrome.runtime.sendMessage({ type: 'SET_TOKEN', token: data.token });
    checkLogin();
  } catch (err) {
    errorEl.textContent = 'Backend not running or network error';
    errorEl.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', async () => {
  await chrome.storage.local.remove(['token', 'userEmail', 'sessions']);
  checkLogin();
});

checkLogin();