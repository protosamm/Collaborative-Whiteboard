const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// serve the client folder
app.use(express.static(path.join(__dirname, '../client')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// rooms Map — roomCode → { hostId, password, clients }
const rooms = new Map();

io.on('connection', socket => {
  console.log('client connected:', socket.id);

  socket.on('create-room', ({ roomCode, password }) => {
    if(rooms.size >= 500) {
      socket.emit('error', { message: 'Server full, try again later' });
      return;
    }
    
    if (rooms.has(roomCode)) {
      socket.emit('error', { message: 'Room already exists' });
      return;
    }
    rooms.set(roomCode, {
      hostId: socket.id,
      password: password || '',
      clients: new Set([socket.id])
    });
    socket.join(roomCode);
    socket.emit('room-created', { roomCode });
    console.log(`room created: ${roomCode}`);
  });

  socket.on('join-room', ({ roomCode, password }) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    if (room.password && room.password !== password) {
      socket.emit('error', { message: 'Wrong password' });
      return;
    }
    room.clients.add(socket.id);
    socket.join(roomCode);

    // tell the joining client they're in
    socket.emit('joined-room', { roomCode });

    // tell the host to send board state to this new client
    io.to(room.hostId).emit('send-board-state', { to: socket.id });
    console.log(`client joined room: ${roomCode}`);
  });

  // host sends board state to a specific new joiner
  socket.on('board-state', ({ to, strokes }) => {
    io.to(to).emit('board-state', { strokes });
  });

  // relay new stroke to everyone else in the room
  socket.on('stroke-added', ({ roomCode, stroke }) => {
    socket.to(roomCode).emit('stroke-added', { stroke });
  });

  // relay erase to everyone else in the room
  socket.on('strokes-erased', ({ roomCode, ids }) => {
    socket.to(roomCode).emit('strokes-erased', { ids });
  });

  socket.on('cursor-move', ({ roomCode, x, y }) => {
    socket.to(roomCode).emit('cursor-move', {
      id: socket.id,
      x, y
    });
  });

  socket.on('disconnect', () => {
    console.log('client disconnected:', socket.id);

    rooms.forEach((room, roomCode) => {
      if (!room.clients.has(socket.id)) return;
      // inside disconnect handler
      socket.to(roomCode).emit('cursor-remove', { id: socket.id });
      room.clients.delete(socket.id);

      // last person left — close room immediately
      if (room.clients.size === 0) {
        rooms.delete(roomCode);
        console.log(`room ${roomCode} closed — everyone left`);
        return;
      }

      // host left but others remain — migrate host
      if (room.hostId === socket.id) {
        const newHostId = [...room.clients][0];
        room.hostId = newHostId;
        io.to(newHostId).emit('promoted-to-host');
        console.log(`host migrated to ${newHostId} in room ${roomCode}`);
      }
    });
  });

  socket.on('leave-room', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;
    room.clients.delete(socket.id);
    socket.leave(roomCode);

    if (room.clients.size === 0) {
      room.closeTimer = setTimeout(() => {
        rooms.delete(roomCode);
      }, 5 * 60 * 1000);
      return;
    }

    if (room.hostId === socket.id) {
      const newHostId = [...room.clients][0];
      room.hostId = newHostId;
      io.to(newHostId).emit('promoted-to-host');
    }
  });
});

server.listen(3000, () => {
  console.log('server running on http://localhost:3000');
});