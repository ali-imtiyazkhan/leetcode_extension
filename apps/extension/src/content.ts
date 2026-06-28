import { User, ChatMessage } from '@leetcode-collab/types';

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

// Global state
let roomUsers: User[] = [];

function initSync() {
  if (currentSlug) {
    chrome.runtime.sendMessage({ type: 'UPDATE_SLUG', slug: currentSlug });
  }
}

initSync();

setInterval(() => {
  const newSlug = getSlug();
  if (newSlug !== currentSlug) {
    currentSlug = newSlug;
    if (currentSlug) {
      console.log('Slug changed view:', currentSlug);
      chrome.runtime.sendMessage({ type: 'UPDATE_SLUG', slug: currentSlug });
      initSync();
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
    <span class="collab-label">Voice & Video</span>
    <div style="display:flex; align-items:center; gap: 8px;">
      <span id="user-count">0</span>
      <button id="minimize-btn" title="Minimize/Expand">_</button>
    </div>
  </div>
  <div id="collab-content">
    <div id="user-list">
      <i>Scanning for users...</i>
    </div>
    <div id="chat-container" style="display: flex; flex-direction: column; height: 150px; margin-top: 10px; border-top: 1px solid #333; padding-top: 10px;">
      <div id="chat-messages" style="flex: 1; overflow-y: auto; font-size: 11px; margin-bottom: 5px; display: flex; flex-direction: column; gap: 4px;"></div>
      <div style="display: flex;">
        <input type="text" id="chat-input" placeholder="Type a message..." style="flex: 1; font-size: 11px; padding: 4px; background: #333; color: white; border: 1px solid #444; border-radius: 4px;" />
        <button id="chat-send" style="margin-left: 4px; padding: 4px 8px; font-size: 11px; background: #ffa116; color: white; border: none; border-radius: 4px; cursor: pointer;">Send</button>
      </div>
    </div>
    <div id="call-overlay" style="display:none;">
      <div style="font-size: 11px; margin-bottom: 8px;"><span id="caller-id" style="color: #ffa116; font-weight: bold;">...</span></div>
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
    try {
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (e: any) {
      console.warn('Failed to get video/audio, trying audio only:', e);
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Hide local video if no video stream
        const localVideo = document.getElementById('local-video') as HTMLVideoElement;
        if (localVideo) localVideo.style.display = 'none';
      } catch (audioErr: any) {
        console.error('Failed to get audio too:', audioErr);
        alert('Could not access microphone or camera. Please check your permissions or if another app is using them.');
        cleanupCall();
        return;
      }
    }
    
    const localVideo = document.getElementById('local-video') as HTMLVideoElement;
    if (localVideo && localStream.getVideoTracks().length > 0) {
      localVideo.srcObject = localStream;
      localVideo.style.display = 'block';
    }

    peerConnection = new RTCPeerConnection(configuration);
    
    peerConnection.onconnectionstatechange = () => {
      console.log('Connection State:', peerConnection?.connectionState);
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE Connection State:', peerConnection?.iceConnectionState);
    };

    localStream.getTracks().forEach(track => peerConnection?.addTrack(track, localStream!));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        chrome.runtime.sendMessage({ type: 'ICE_CANDIDATE', to: remoteId, candidate: event.candidate });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, event.streams);
      const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;
      if (remoteVideo) {
        if (event.streams && event.streams[0]) {
          remoteVideo.srcObject = event.streams[0];
        } else if (!remoteVideo.srcObject) {
          remoteVideo.srcObject = new MediaStream([event.track]);
        } else {
          (remoteVideo.srcObject as MediaStream).addTrack(event.track);
        }
        remoteVideo.play().catch(e => console.error('Play failed:', e));
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
    roomUsers = message.users as User[];
    const users = roomUsers.filter(u => u.id !== myId);
    const list = document.getElementById('user-list');
    if (list) {
      document.getElementById('user-count')!.innerText = users.length.toString();
      list.innerHTML = users.length > 0 ? users.map(u => {
        const displayName = u.name || `User ${u.id.substring(0, 4)}`;
        return `
        <div class="user-item">
          <span style="font-size: 11px;">${displayName}</span>
          <button onclick="window.postMessage({type: 'CALL_USER', to: '${u.id}'}, '*')" class="call-btn">
            Call
          </button>
        </div>
      `}).join('') : '<i style="font-size: 11px; color: #666;">No other users here...</i>';
    }
  } else if (message.type === 'incoming_broadcast' || message.type === 'incoming_call') {
    const overlay = document.getElementById('call-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      let fromId = '';
      if (typeof message.from === 'object' && message.from.id) {
          fromId = message.from.id;
      } else {
          fromId = message.from;
      }
      const remoteUser = typeof message.from === 'object' ? message.from : roomUsers.find(u => u.id === fromId);
      const displayName = remoteUser?.name || fromId.substring(0, 8);
      document.getElementById('caller-id')!.innerText = `${displayName} sent a request`;
      overlay.dataset.remoteId = fromId;
    }
  } else if (message.type === 'offer') {
    // We received an offer. Show the overlay instead of starting immediately.
    pendingOffer = message.payload;
    const overlay = document.getElementById('call-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      const fromId = message.from;
      const remoteUser = roomUsers.find(u => u.id === fromId);
      const displayName = remoteUser?.name || fromId.substring(0, 8);
      document.getElementById('caller-id')!.innerText = `${displayName} sent a request`;
      overlay.dataset.remoteId = message.from;
    }
  } else if (message.type === 'answer') {
    if (peerConnection) {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(message.payload));
    }
  } else if (message.type === 'ice-candidate') {
    if (peerConnection && peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(message.payload));
    } else {
      console.log('Queuing ICE candidate');
      iceCandidateQueue.push(message.payload);
    }
  } else if (message.type === 'new_message') {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      const isMe = message.from === myId;
      const sender = roomUsers.find(u => u.id === message.from);
      const displayName = isMe ? 'Me' : (sender?.name || `User ${message.from.substring(0, 4)}`);
      const msgDiv = document.createElement('div');
      msgDiv.style.background = isMe ? '#2a2a2a' : '#333';
      msgDiv.style.padding = '4px 6px';
      msgDiv.style.borderRadius = '4px';
      msgDiv.innerHTML = `<strong style="color: ${isMe ? '#4caf50' : '#ffa116'};">${displayName}:</strong> ${message.text}`;
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
});

// UI Event Handlers
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

document.getElementById('minimize-btn')?.addEventListener('click', () => {
  const content = document.getElementById('collab-content')!;
  const isMinimized = content.style.display === 'none';
  content.style.display = isMinimized ? 'block' : 'none';
  document.getElementById('minimize-btn')!.innerText = isMinimized ? '_' : '+';
});

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CALL_USER') {
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) videoContainer.style.display = 'block';
    startCall(true, event.data.to);
  }
});

document.getElementById('chat-send')?.addEventListener('click', () => {
  const input = document.getElementById('chat-input') as HTMLInputElement;
  const text = input.value.trim();
  if (text && currentSlug) {
    chrome.runtime.sendMessage({ type: 'SEND_CHAT', slug: currentSlug, text });
    input.value = '';
  }
});

document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('chat-send')?.click();
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
