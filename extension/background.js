let currentTab = null;
let startTime = null;
let currentTitle = "";
let isWindowFocused = true;
let sessions = [];

async function initializeTracking() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab && isTrackable(tab.url)) {
      currentTab = tab;
      startTime = Date.now();
      currentTitle = tab.title || "";
    }
  } catch (e) {
    currentTab = null;
    startTime = null;
  }
}

initializeTracking();
chrome.runtime.onStartup.addListener(initializeTracking);
chrome.runtime.onInstalled.addListener(initializeTracking);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PAGE_TITLE") {
    currentTitle = msg.title || "";
  }
  if (msg.type === "SET_TOKEN") {
    chrome.storage.local.set({ token: msg.token });
    sendResponse({ ok: true });
  }
  if (msg.type === "GET_STATUS") {
    sendResponse({
      isTracking: isWindowFocused && !!currentTab,
      currentTitle: currentTitle
    });
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    isWindowFocused = false;
    await saveCurrentSession();
    startTime = null;
  } else {
    isWindowFocused = true;
    try {
      const [tab] = await chrome.tabs.query({ active: true, windowId });
      if (tab && isTrackable(tab.url)) {
        currentTab = tab;
        startTime = Date.now();
        currentTitle = tab.title || "";
      }
    } catch (e) {}
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await saveCurrentSession();
  if (!isWindowFocused) return;

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url && isTrackable(tab.url)) {
      currentTab = tab;
      startTime = Date.now();
      currentTitle = tab.title || "";
    } else {
      currentTab = null;
      startTime = null;
    }
  } catch (e) {
    currentTab = null;
    startTime = null;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!isWindowFocused) return;

  if (changeInfo.status === "complete" && tab.active) {
    await saveCurrentSession();
    if (tab.url && isTrackable(tab.url)) {
      currentTab = tab;
      startTime = Date.now();
      currentTitle = tab.title || "";
    }
  }

  if (changeInfo.title && tab.active) {
    currentTitle = changeInfo.title;
  }
});

function isTrackable(url) {
  if (!url) return false;
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:")
  ) {
    return false;
  }
  if (url.startsWith("file://")) return true;
  if (url.startsWith("http://") || url.startsWith("https://")) return true;
  return false;
}

async function saveCurrentSession() {
  if (!isWindowFocused || !currentTab || !startTime) return;

  const seconds = Math.floor((Date.now() - startTime) / 1000);
  if (seconds < 8) return;

  let domain = "";
  let url = currentTab.url || "";

  try {
    if (url.startsWith("file://")) {
      domain = "local-file";
    } else {
      domain = new URL(url).hostname.replace("www.", "");
    }
  } catch (e) {
    domain = "unknown";
  }

  const date = new Date().toISOString().split("T")[0];

  const session = {
    domain,
    url,
    title: currentTitle || currentTab.title || "",
    seconds,
    date
  };

  const stored = await chrome.storage.local.get(["sessions"]);
  const all = stored.sessions || [];
  all.push(session);
  await chrome.storage.local.set({ sessions: all });

  startTime = Date.now();
}

chrome.alarms.create("sync", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "sync") {
    await syncToServer();
  }
});

async function syncToServer() {
  await saveCurrentSession();

  const data = await chrome.storage.local.get(["token", "sessions"]);
  const token = data.token;
  const storedSessions = data.sessions || [];

  if (!token || storedSessions.length === 0) return;

  try {
    const res = await fetch("http://localhost:5000/api/activity/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sessions: storedSessions })
    });

    if (res.ok) {
      await chrome.storage.local.set({ sessions: [] });
      console.log("FocusTrack: Synced");
    }
  } catch (e) {
    console.log("FocusTrack: Sync failed");
  }
}