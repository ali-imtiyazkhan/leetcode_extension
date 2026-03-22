import { User, SignalMessage } from '@leetcode-collab/types';

let socket: WebSocket | null = null;
let currentSlug: string | null = null;

function connect() {
  const wsUrl = "ws://localhost:3001/socket.io/?EIO=4&transport=websocket";
  socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log('Connected to backend');
    if (currentSlug) {
      sendSocketMessage('join_problem', { slug: currentSlug, user: { id: 'user-' + Math.floor(Math.random() * 1000) } });
    }
  };

  socket.onmessage = (event) => {
    let rawData = event.data as string;
    if (rawData.startsWith('42')) {
      const [type, payload] = JSON.parse(rawData.substring(2));
      handleSocketEvent(type, payload);
    }
  };
}

function sendSocketMessage(type: string, payload: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(`42${JSON.stringify([type, payload])}`);
  }
}

function handleSocketEvent(type: string, payload: any) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type, ...payload });
    }
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'UPDATE_SLUG') {
    currentSlug = message.slug;
    sendSocketMessage('join_problem', { slug: currentSlug, user: { id: 'user-' + Math.floor(Math.random() * 1000) } });
  } else if (message.type === 'BROADCAST_REQUEST') {
    sendSocketMessage('broadcast_invite', { slug: currentSlug, from: { id: 'me' } }); 
  } else if (message.type === 'SEND_OFFER') {
    sendSocketMessage('call_user', { to: message.to, from: 'me', type: 'offer', payload: message.offer });
  } else if (message.type === 'SEND_ANSWER') {
    sendSocketMessage('answer_call', { to: message.to, from: 'me', type: 'answer', payload: message.answer });
  } else if (message.type === 'ICE_CANDIDATE') {
    sendSocketMessage('ice_candidate', { to: message.to, from: 'me', type: 'ice-candidate', payload: message.candidate });
  }
});

connect();
