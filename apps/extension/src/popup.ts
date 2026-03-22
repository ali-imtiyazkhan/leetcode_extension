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

document.addEventListener('DOMContentLoaded', updateStatus);
setInterval(updateStatus, 2000);
