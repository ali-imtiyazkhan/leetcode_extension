// popup.ts
console.log('LeetCode Collab Popup loaded');

function updateStatus() {
  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    const statusEl = document.getElementById('status');
    if (statusEl && response) {
      statusEl.innerText = response.status || 'Connected';
    }
  });
}

function initAuth() {
  const authContainer = document.getElementById('auth-container');
  const userInfo = document.getElementById('user-info');
  const usernameInput = document.getElementById('username') as HTMLInputElement;
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const displayName = document.getElementById('display-name');

  chrome.storage.local.get(['username'], (result) => {
    if (result.username) {
      if (authContainer) authContainer.style.display = 'none';
      if (userInfo) userInfo.style.display = 'block';
      if (displayName) displayName.innerText = result.username;
    } else {
      if (authContainer) authContainer.style.display = 'block';
      if (userInfo) userInfo.style.display = 'none';
    }
  });

  loginBtn?.addEventListener('click', () => {
    const name = usernameInput?.value.trim();
    if (name) {
      chrome.storage.local.set({ username: name }, () => {
        if (authContainer) authContainer.style.display = 'none';
        if (userInfo) userInfo.style.display = 'block';
        if (displayName) displayName.innerText = name;
        chrome.runtime.sendMessage({ type: 'UPDATE_USER_INFO' });
      });
    }
  });

  logoutBtn?.addEventListener('click', () => {
    chrome.storage.local.remove(['username'], () => {
      if (authContainer) authContainer.style.display = 'block';
      if (userInfo) userInfo.style.display = 'none';
      if (usernameInput) usernameInput.value = '';
      chrome.runtime.sendMessage({ type: 'UPDATE_USER_INFO' });
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateStatus();
  initAuth();
});
setInterval(updateStatus, 2000);
