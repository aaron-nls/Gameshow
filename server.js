// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let gamePosition = {    
  game: 'playerName',
  screen: 0,
  json: {},
};

let answers = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('New client connected');

  
  socket.on('startGame', (game) => {
    startGame(game);
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
    players[player.id] = {name: player.name, team: 1, score: 0};
    io.emit('updatePlayers', players);
    io.emit('gameUpdateforPlayer', {'playerId': player.id, ...gamePosition} );
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
  
  socket.on('addPoints', (playerId) => {
    console.log('Adding points to Player ' + playerId );
    players[playerId].score = players[playerId].score + 50;
    io.emit('updatePlayers', players);
  });

  
  socket.on('switchTeam', (playerId) => {
    console.log('Switch Team for Player ' + playerId );
    players[playerId].team = players[playerId].team == 1 ? 2 : 1;
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

  socket.on('nextScreen', () => {
    nextScreen();
  });
  socket.on('submitAnswer', (answer) => {
    console.log('answer received');
    answers[answer.playerId] = answer.correct * 10;
    players[answer.playerId].score = players[answer.playerId].score + (answer.correct * 10);

    io.emit('updatePlayers', players);

    if(answers.length == players.length){
      console.log('all answers received');
      answers = {};
      io.emit('revealAnswer');
      
      setTimeout(() => {
        console.log('SCREENS: ' + Object.keys(gamePosition.json).length);
        console.log('CUR SCREEN: ' + gamePosition.screen);
        if(gamePosition.screen == Object.keys(gamePosition.json).length){
          startGame('leaderboard');
        }else{
          nextScreen();
        }
      }, 10000); // Wait for 10 seconds
    }
  });
});


function startGame(game){
  console.log('Startimg game ' + game);
    gamePosition.game = game;
    gamePosition.screen = 0;

    fs.readFile('public/games/' + game + '.json', 'utf8', (err, data) => {
      if (err) {
        gamePosition.json = {};
      }else{
        gamePosition.json = JSON.parse(data);
      }
      io.emit('gameStart', gamePosition);
      console.log(gamePosition.json);
    });
}

function nextScreen(){
  console.log('nextScreen');
  gamePosition.screen = gamePosition.screen+1;
  console.log(gamePosition.screen);
  io.emit('changeScreen', gamePosition.screen);

}

server.listen(8080, () => console.log('Server listening on port 8080'));