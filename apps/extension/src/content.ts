import { User } from '@leetcode-collab/types';

console.log('LeetCode Collab content script loaded (TS)');

function getSlug(): string | null {
  const parts = window.location.pathname.split('/');
  return parts.includes('problems') ? parts[parts.indexOf('problems') + 1] : null;
}

const currentSlug = getSlug();
if (currentSlug) {
  chrome.runtime.sendMessage({ type: 'UPDATE_SLUG', slug: currentSlug });
}

// Global state for WebRTC
let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

// Injected UI
const container = document.createElement('div');
container.id = 'leetcode-collab-root';
container.style.cssText = `
  position: fixed; bottom: 20px; right: 20px; z-index: 9999;
  background: #1e1e1e; color: white; padding: 15px; border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.6); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 280px; border: 1px solid #333; cursor: default;
`;

container.innerHTML = `
  <div id="drag-handle" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; cursor: move; border-bottom: 1px solid #333; padding-bottom: 8px;">
    <span style="font-weight: 600; color: #ffa116;">Collaborators</span>
    <span id="user-count" style="font-size: 11px; background: #333; padding: 2px 6px; border-radius: 10px;">0</span>
  </div>
  <button id="broadcast-btn" style="width: 100%; background: linear-gradient(90deg, #ffa116, #ff7a00); border: none; color: black; font-weight: bold; border-radius: 8px; padding: 10px; cursor: pointer; margin-bottom: 15px; font-size: 13px; box-shadow: 0 4px 10px rgba(255,161,22,0.2);">
    Broadcast Help Request 🚀
  </button>
  <div id="user-list" style="max-height: 150px; overflow-y: auto; font-size: 13px;">
    <i>Scanning for users...</i>
  </div>
  <div id="call-overlay" style="display:none; margin-top: 15px; border-top: 1px solid #333; padding-top: 10px; background: #1a1a1a; padding: 10px; border-radius: 8px;">
    <div style="font-size: 11px; margin-bottom: 8px;">Call from <span id="caller-id" style="color: #ffa116; font-weight: bold;">...</span></div>
    <div style="display: flex; gap: 8px;">
      <button id="accept-call" style="background: #28a745; color: white; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; flex: 1; font-weight: bold; font-size: 12px;">Accept</button>
      <button id="decline-call" style="background: #dc3545; color: white; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; flex: 1; font-weight: bold; font-size: 12px;">Decline</button>
    </div>
  </div>
  <div id="video-container" style="display:none; margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
    <video id="local-video" autoplay muted style="width: 100%; border-radius: 8px; background: #000; margin-bottom: 5px;"></video>
    <video id="remote-video" autoplay style="width: 100%; border-radius: 8px; background: #000;"></video>
    <button id="end-call" style="width: 100%; background: #dc3545; color: white; border: none; border-radius: 8px; padding: 8px; cursor: pointer; margin-top: 10px; font-weight: bold; font-size: 12px;">End Call</button>
  </div>
`;

document.body.appendChild(container);

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
            const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;
            if (remoteVideo) remoteVideo.srcObject = event.streams[0];
        };

        if (isCaller) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            chrome.runtime.sendMessage({ type: 'SEND_OFFER', to: remoteId, offer });
        }
    } catch (err) {
        console.error('Failed to start call:', err);
    }
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'room_users') {
    const users = message.users as User[];
    const list = document.getElementById('user-list');
    if (list) {
      document.getElementById('user-count')!.innerText = users.length.toString();
      list.innerHTML = users.length > 0 ? users.map(u => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; background: #2a2a2a; padding: 6px; border-radius: 6px;">
          <span style="font-size: 11px;">User ${u.id.substring(0, 4)}</span>
          <button onclick="window.postMessage({type: 'CALL_USER', to: '${u.id}'}, '*')" 
                  style="background: transparent; border: 1px solid #ffa116; color: #ffa116; border-radius: 4px; padding: 2px 6px; cursor: pointer; font-size: 10px;">
            Call
          </button>
        </div>
      `).join('') : '<i style="font-size: 11px; color: #666;">No other users here...</i>';
    }
  } else if (message.type === 'incoming_broadcast' || message.type === 'incoming_call') {
    const overlay = document.getElementById('call-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      document.getElementById('caller-id')!.innerText = message.from.id.substring(0, 8);
      overlay.dataset.remoteId = message.from.id;
    }
  } else if (message.type === 'offer') {
      await startCall(false, message.from);
      await peerConnection?.setRemoteDescription(new RTCSessionDescription(message.payload));
      const answer = await peerConnection?.createAnswer();
      await peerConnection?.setLocalDescription(answer);
      chrome.runtime.sendMessage({ type: 'SEND_ANSWER', to: message.from, answer });
  } else if (message.type === 'answer') {
      await peerConnection?.setRemoteDescription(new RTCSessionDescription(message.payload));
  } else if (message.type === 'ice-candidate') {
      await peerConnection?.addIceCandidate(new RTCIceCandidate(message.payload));
  }
});

// UI Event Handlers
document.getElementById('broadcast-btn')?.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'BROADCAST_REQUEST' });
  const btn = document.getElementById('broadcast-btn') as HTMLButtonElement;
  btn.innerText = 'Request Sent!';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerText = 'Broadcast Help Request 🚀';
    btn.disabled = false;
  }, 5000);
});

document.getElementById('accept-call')?.addEventListener('click', () => {
    const overlay = document.getElementById('call-overlay')!;
    const remoteId = overlay.dataset.remoteId!;
    overlay.style.display = 'none';
    document.getElementById('video-container')!.style.display = 'block';
    startCall(true, remoteId);
});

document.getElementById('decline-call')?.addEventListener('click', () => {
    document.getElementById('call-overlay')!.style.display = 'none';
});

document.getElementById('end-call')?.addEventListener('click', () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    document.getElementById('video-container')!.style.display = 'none';
});

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CALL_USER') {
    chrome.runtime.sendMessage({ type: 'CALL_USER', to: event.data.to });
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
