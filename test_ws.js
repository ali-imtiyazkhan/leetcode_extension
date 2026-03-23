const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:3001/socket.io/?EIO=4&transport=websocket');

ws.on('open', () => {
  console.log('Connected!');
  
  // Send connect packet to start session in Socket.io
  ws.send('40');
  
  // Simulate what background.ts does: send message
  setTimeout(() => {
    const pkt = '42' + JSON.stringify(['join_problem', { slug: 'two-sum', user: { id: 'test-user' } }]);
    console.log('Sending:', pkt);
    ws.send(pkt);
  }, 100);
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
});

ws.on('error', (err) => {
  console.error('Error:', err);
});

setTimeout(() => {
  console.log('Done.');
  process.exit(0);
}, 5000);
