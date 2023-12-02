// client.js (inside public folder)

const socket = io('http://localhost:8080');
let playerId = null;
let currentGame = null;


$(document).ready(function() { 
  checkIfSessionExists();
});

function checkIfSessionExists() {
  console.log('Checking if session exists...');
  if (localStorage.getItem('playerId')) {
    playerId = localStorage.getItem('playerId');
    socket.emit('checkPlayer', playerId);
    return true;
  }
  
  changeGame('playerName', 1);
}

/* Get Game */
function getGame() {
  console.log('Getting game position...');
  socket.emit('getGame');
}

/* Change Game */
function changeGame(game, screen) {
  $('game').removeClass('active');
  $('#' + game).addClass('active');
  changeScreen(screen);
}

/* Change Screen */
function changeScreen(screen) {
  $('game:visible screen').removeClass('active');
  $('game:visible screen[data-id="' + screen + '"]').addClass('active');

  let enterFunction = $('game:visible screen.active').attr('data-enter');

  if(enterFunction) {
    window[enterFunction]();
  }
}

function nextPage() {
  $('game:visible screen.active page').hide().next().show();
}

/* Game Changer */
socket.on('gameStart', (gamePosition) => {
  currentGame = gamePosition.game;
  changeGame(gamePosition.game, gamePosition.screen);
});

/* Game Update */
socket.on('gameUpdateforPlayer', (gamePosition) => {
  if(playerId == gamePosition.playerId) {
    console.log('Game update received: ' + gamePosition.game + ' - ' + gamePosition.screen);
    if(gamePosition.game !== currentGame) {
      changeGame(gamePosition.game, gamePosition.screen);
    }
  }
});

/* Game Update */
socket.on('gameUpdate', (gamePosition) => {
  console.log('Game update received: ' + gamePosition.game + ' - ' + gamePosition.screen);
  if(gamePosition.game !== currentGame) {
    changeGame(gamePosition.game, gamePosition.screen);
  }
});


socket.on('playerCheck', (verification) => {
  console.log('Player check received: ' + verification.playerId + ' - ' + verification.playerExists);
  if(playerId == verification.playerId) {
    if(verification.playerExists == false){
      console.log('Player does not exist');
      playerId = null;
      localStorage.removeItem('playerId');
      changeGame('playerName', 1);
    }else{
      socket.emit('getGameforPlayer', playerId);
    }
  }
 });



/* GAME FUNCTIONS
***************/


function playerName() {
 
 if(playerId) {
  nextPage();
 }else{
  
  /* Submit Player Name */ 
  $('.addPlayer').click(function() {
    let playerName = $('.playerName').val();
    if(playerName === '') {
      alert('Please enter your name');
      return false;
    }

    playerId = Math.random().toString(36).substr(2, 5);
    localStorage.setItem('playerId', playerId);
    nextPage();
    socket.emit('addPlayer', {'name': playerName, 'id': playerId});
    getGame();
  });

 }
}