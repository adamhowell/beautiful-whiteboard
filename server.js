const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('add-box', (box) => {
    socket.broadcast.emit('box-added', box);
  });

  socket.on('move-box', ({ id, x, y }) => {
    socket.broadcast.emit('box-moved', { id, x, y });
  });

  socket.on('move-boxes', (updates) => {
    socket.broadcast.emit('boxes-moved', updates);
  });

  socket.on('resize-box', ({ id, width, height }) => {
    socket.broadcast.emit('box-resized', { id, width, height });
  });

  socket.on('delete-boxes', (deletedIds) => {
    socket.broadcast.emit('boxes-deleted', deletedIds);
  });
});

const PORT = 3001;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
