// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('message', (message) => {
    io.emit('message', message);
  });
  socket.on('gameStart', (game) => {
    console.log('startimg game');
    io.emit('gameStart', game);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => console.log('Server listening on port 8080'));