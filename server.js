const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Connected: new', socket.id);

  socket.on('join-room', (roomId) => {
    console.log('JOIN ROOM:', roomId, socket.id);

    socket.join(roomId);

    const room = io.sockets.adapter.rooms.get(roomId);

    console.log('ROOM MEMBERS:', roomId, room ? [...room] : []);

    const clients = Array.from(room || []);

    socket.emit(
      'all-users',
      clients.filter((id) => id !== socket.id)
    );

    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('join-room', (roomId) => {
    console.log('asf', 'roomid');
    socket.join(roomId);

    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    socket.emit(
      'all-users',
      clients.filter((id) => id !== socket.id)
    );

    socket.to(roomId).emit('user-joined', socket.id);
  });

  socket.on('sending-signal', (payload) => {
    io.to(payload.userToSignal).emit('user-signal', {
      signal: payload.signal,
      callerId: payload.callerId,
    });
  });

  socket.on('returning-signal', (payload) => {
    io.to(payload.callerId).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log('Disconnected');
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    console.log('join-room', roomId, socket.id);
  });

  socket.on('sending-signal', (payload) => {
    console.log('sending-signal', payload);
  });

  socket.on('returning-signal', (payload) => {
    console.log('returning-signal', payload);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
