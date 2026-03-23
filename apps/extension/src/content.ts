import { User } from '@leetcode-collab/types';

console.log('LeetCode Collab content script loaded (TS)');

function getSlug(): string | null {
  const parts = window.location.pathname.split('/');
  return parts.includes('problems') ? parts[parts.indexOf('problems') + 1] : null;
}

let myId: string | null = null;
let currentSlug = getSlug();
if (currentSlug) {
  chrome.runtime.sendMessage({ type: 'UPDATE_SLUG', slug: currentSlug }, (response) => {
    if (response && response.myId) {
      myId = response.myId;
      console.log('Registered own ID:', myId);
    }
  });
}

// Support single-page application (SPA) navigation on LeetCode
setInterval(() => {
  const newSlug = getSlug();
  if (newSlug !== currentSlug) {
    currentSlug = newSlug;
    if (currentSlug) {
      console.log('Slug changed view:', currentSlug);
      chrome.runtime.sendMessage({ type: 'UPDATE_SLUG', slug: currentSlug });
    }
  }
}, 2000);

// Global state for WebRTC
let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let pendingOffer: any = null;
let iceCandidateQueue: RTCIceCandidateInit[] = [];
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Injected UI
const container = document.createElement('div');
container.id = 'leetcode-collab-root';
container.innerHTML = `
  <div id="drag-handle">
    <span class="collab-label">Collaborators</span>
    <span id="user-count">0</span>
  </div>
  <button id="broadcast-btn">
    Broadcast Help Request 🚀
  </button>
  <div id="user-list">
    <i>Scanning for users...</i>
  </div>
  <div id="call-overlay" style="display:none;">
    <div style="font-size: 11px; margin-bottom: 8px;">Call from <span id="caller-id" style="color: #ffa116; font-weight: bold;">...</span></div>
    <div class="overlay-actions">
      <button id="accept-call" class="accept-btn">Accept</button>
      <button id="decline-call" class="decline-btn">Decline</button>
    </div>
  </div>
  <div id="video-container" style="display:none;">
    <video id="remote-video" autoplay playsinline></video>
    <video id="local-video" autoplay muted playsinline></video>
    <button id="end-call" title="End Call">✕</button>
  </div>
`;

document.body.appendChild(container);

async function cleanupCall() {
  console.log('Cleaning up call...');
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;
  const localVideo = document.getElementById('local-video') as HTMLVideoElement;
  if (remoteVideo) remoteVideo.srcObject = null;
  if (localVideo) localVideo.srcObject = null;
  
  const videoContainer = document.getElementById('video-container');
  if (videoContainer) videoContainer.style.display = 'none';
  pendingOffer = null;
  iceCandidateQueue = [];
}

async function startCall(isCaller: boolean, remoteId: string) {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById('local-video') as HTMLVideoElement;
    if (localVideo) localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(configuration);
    localStream.getTracks().forEach(track => peerConnection?.addTrack(track, localStream!));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        chrome.runtime.sendMessage({ type: 'ICE_CANDIDATE', to: remoteId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.streams[0]);
      const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
        remoteVideo.play().catch(e => console.error('Failed to play remote video:', e));
      }
    };

    if (isCaller) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      chrome.runtime.sendMessage({ type: 'SEND_OFFER', to: remoteId, offer });
    } else if (pendingOffer) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      chrome.runtime.sendMessage({ type: 'SEND_ANSWER', to: remoteId, answer });
      pendingOffer = null;
      
      // Process queued candidates
      console.log('Processing queued candidates:', iceCandidateQueue.length);
      while (iceCandidateQueue.length > 0) {
        const candidate = iceCandidateQueue.shift()!;
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    }
  } catch (err) {
    console.error('Failed to start call:', err);
    cleanupCall();
  }
}

chrome.runtime.onMessage.addListener(async (message) => {
  console.log('Received message in content script:', message.type, message);
  
  if (message.myId) myId = message.myId;

  if (message.type === 'room_users') {
    const users = (message.users as User[]).filter(u => u.id !== myId);
    const list = document.getElementById('user-list');
    if (list) {
      document.getElementById('user-count')!.innerText = users.length.toString();
      list.innerHTML = users.length > 0 ? users.map(u => `
        <div class="user-item">
          <span style="font-size: 11px;">User ${u.id.substring(0, 4)}</span>
          <button onclick="window.postMessage({type: 'CALL_USER', to: '${u.id}'}, '*')" class="call-btn">
            Call
          </button>
        </div>
      `).join('') : '<i style="font-size: 11px; color: #666;">No other users here...</i>';
    }
  } else if (message.type === 'incoming_broadcast' || message.type === 'incoming_call') {
    const overlay = document.getElementById('call-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      const fromId = typeof message.from === 'object' && message.from.id ? message.from.id : message.from;
      document.getElementById('caller-id')!.innerText = fromId.substring(0, 8);
      overlay.dataset.remoteId = fromId;
    }
  } else if (message.type === 'offer') {
    // We received an offer. Show the overlay instead of starting immediately.
    pendingOffer = message.payload;
    const overlay = document.getElementById('call-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      document.getElementById('caller-id')!.innerText = message.from.substring(0, 8);
      overlay.dataset.remoteId = message.from;
    }
  } else if (message.type === 'answer') {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.payload));
      // If we are caller, we might also have queued candidates? Usually candidates arrive after offer/answer.
    }
  } else if (message.type === 'ice-candidate') {
    if (peerConnection && peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.payload));
    } else {
      console.log('Queuing ICE candidate');
      iceCandidateQueue.push(message.payload);
    }
  }
});

// UI Event Handlers
document.getElementById('broadcast-btn')?.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'BROADCAST_REQUEST', slug: getSlug() });
  const btn = document.getElementById('broadcast-btn') as HTMLButtonElement;
  const originalText = btn.innerText;
  btn.innerText = 'Request Sent!';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerText = originalText;
    btn.disabled = false;
  }, 5000);
});

document.getElementById('accept-call')?.addEventListener('click', async () => {
  const overlay = document.getElementById('call-overlay')!;
  const remoteId = overlay.dataset.remoteId!;
  overlay.style.display = 'none';
  document.getElementById('video-container')!.style.display = 'block';
  
  if (pendingOffer) {
    // If we have a pending offer, start as receiver
    await startCall(false, remoteId);
  } else {
    // Otherwise, start as caller (should not happen in normal flow but for safety)
    await startCall(true, remoteId);
  }
});

document.getElementById('decline-call')?.addEventListener('click', () => {
  document.getElementById('call-overlay')!.style.display = 'none';
  pendingOffer = null;
});

document.getElementById('end-call')?.addEventListener('click', () => {
  cleanupCall();
});

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CALL_USER') {
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) videoContainer.style.display = 'block';
    startCall(true, event.data.to);
  }
});

// Draggable Logic
let isDragging = false;
let initialX: number;
let initialY: number;

const handle = document.getElementById('drag-handle')!;
handle.addEventListener('mousedown', (e) => {
  isDragging = true;
  initialX = e.clientX - container.offsetLeft;
  initialY = e.clientY - container.offsetTop;
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    e.preventDefault();
    container.style.left = (e.clientX - initialX) + 'px';
    container.style.top = (e.clientY - initialY) + 'px';
    container.style.bottom = 'auto';
    container.style.right = 'auto';
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
});
