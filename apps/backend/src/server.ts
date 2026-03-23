import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { User, SignalMessage } from '@leetcode-collab/types';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const rooms = new Map<string, Map<string, User>>();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_problem', ({ slug, user }: { slug: string, user: User }) => {
    socket.join(slug);
    
    if (!rooms.has(slug)) {
      rooms.set(slug, new Map());
    }
    rooms.get(slug)!.set(socket.id, { ...user, id: socket.id });

    io.to(slug).emit('room_users', Array.from(rooms.get(slug)!.values()));
  });

  socket.on('disconnect', () => {
    rooms.forEach((users, slug) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        io.to(slug).emit('room_users', Array.from(users.values()));
        if (users.size === 0) rooms.delete(slug);
      }
    });
  });

  socket.on('call_user', (data: SignalMessage) => {
    io.to(data.to).emit('incoming_call', data);
  });

  socket.on('answer_call', (data: SignalMessage) => {
    io.to(data.to).emit('call_answered', data);
  });

  socket.on('broadcast_invite', ({ slug, from }: { slug: string, from?: User }) => {
    const sender = from && from.id ? from : { id: socket.id };
    socket.to(slug).emit('incoming_broadcast', { from: sender });
    console.log(`Broadcast correctly from ${sender.id} in room slug: ${slug}`);
  });

  socket.on('ice_candidate', (data: SignalMessage) => {
    io.to(data.to).emit('ice_candidate', data);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`TS Server running on port ${PORT}`);
});
