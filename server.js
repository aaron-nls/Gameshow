// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let gamePosition = {    
  game: 'start',
  screen: 1
};

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('New client connected');

  
  socket.on('startGame', (game) => {
    console.log('Startimg game ' + game);
    gamePosition.game = game;
    gamePosition.screen = 1;
    io.emit('gameStart', gamePosition);
  });

  socket.on('getGame', () => {
    console.log('Updating user game position');
    io.emit('gameUpdate', gamePosition);
  });

  socket.on('getGameforPlayer', (playerId) => {
    console.log('Updating user game position');
    io.emit('gameUpdateforPlayer', {'playerId': playerId, ...gamePosition} );
  });

  socket.on('addPlayer', (player) => {
    players[player.id] = {name: player.name, score: 0};
    io.emit('updatePlayers', players);
  });

  socket.on('checkPlayer', (playerId) => {
    let playerExists = false;
    if(players[playerId]){
      playerExists = true;
    }
    io.emit('playerCheck', {playerExists: playerExists, playerId: playerId});
  });

  
  socket.on('removePlayer', (playerId) => {
    console.log('Removing Player ' + playerId );
    delete players[playerId];
    io.emit('updatePlayers', players);
  });

  socket.on('getPlayers', () => {
    console.log('Getting Players');
    io.emit('updatePlayers', players);
  });

  socket.on('clearPlayers', () => {
    players= {};
    io.emit('updatePlayers', {});
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(8080, () => console.log('Server listening on port 8080'));