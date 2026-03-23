import { io, Socket } from 'socket.io-client';
import { User, SignalMessage } from '@leetcode-collab/types';

let socket: Socket | null = null;
let currentSlug: string | null = null;

function connect() {
  // Use http://127.0.0.1:3001 to bypass local DNS ipv6 quirks if any on windows solvers
  socket = io("http://127.0.0.1:3001", {
    transports: ['websocket'], // Force websocket for extension context
  });

  socket.on('connect', () => {
    console.log('Connected to backend:', socket?.id);
    if (currentSlug) {
      socket?.emit('join_problem', { slug: currentSlug, user: { id: socket?.id } });
    }
  });

  socket.on('room_users', (users) => {
    handleSocketEvent('room_users', { users });
  });

  socket.on('incoming_call', (data) => {
    handleSocketEvent('incoming_call', data);
  });

  socket.on('incoming_broadcast', (data) => {
    handleSocketEvent('incoming_broadcast', data);
  });

  socket.on('call_answered', (data) => {
    handleSocketEvent('answer', data);
  });

  socket.on('ice_candidate', (data) => {
    handleSocketEvent('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from backend');
  });
}

function handleSocketEvent(type: string, payload: any) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type, ...payload });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_SLUG') {
    currentSlug = message.slug;
    socket?.emit('join_problem', { slug: currentSlug, user: { id: socket?.id } });
  } else if (message.type === 'BROADCAST_REQUEST') {
    const activeSlug = message.slug || currentSlug;
    socket?.emit('broadcast_invite', { slug: activeSlug, from: { id: socket?.id || 'unknown' } }); 
  } else if (message.type === 'SEND_OFFER') {
    socket?.emit('call_user', { to: message.to, from: socket?.id, type: 'offer', payload: message.offer });
  } else if (message.type === 'SEND_ANSWER') {
    socket?.emit('answer_call', { to: message.to, from: socket?.id, type: 'answer', payload: message.answer });
  } else if (message.type === 'ICE_CANDIDATE') {
    socket?.emit('ice_candidate', { to: message.to, from: socket?.id, type: 'ice-candidate', payload: message.candidate });
  } else if (message.type === 'GET_STATUS') {
    sendResponse({ status: 'Connected to LeetCollab Backend' });
  }
});

connect();
