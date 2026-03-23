import { io, Socket } from 'socket.io-client';
import { User, SignalMessage } from '@leetcode-collab/types';

let socket: Socket | null = null;
let currentSlug: string | null = null;
const tabSlugs = new Map<number, string>();

const BACKEND_URL = "http://127.0.0.1:3001";

function connect() {
  console.log('Connecting to backend:', BACKEND_URL);
  socket = io(BACKEND_URL, {
    transports: ['websocket'],
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
    const type = data.type || 'incoming_call';
    handleSocketEvent(type, data);
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
  console.log('Broadcasting socket event:', type, 'to slug:', currentSlug);
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id && tabSlugs.get(tab.id) === currentSlug) {
        chrome.tabs.sendMessage(tab.id, { ...payload, type, myId: socket?.id });
      }
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);

  if (message.type === 'UPDATE_SLUG') {
    currentSlug = message.slug;
    if (sender.tab?.id) {
      tabSlugs.set(sender.tab.id, message.slug);
    }
    socket?.emit('join_problem', { slug: currentSlug, user: { id: socket?.id } });
    if (socket?.id) {
      sendResponse({ myId: socket.id });
    }
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
    sendResponse({ status: 'Connected', socketId: socket?.id });
  }
  
  return true;
});

connect();
