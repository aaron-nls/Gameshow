// client.js (inside public folder)

const socket = io('http://localhost:8080');
const form = document.getElementById('message-form');
const messageBox = document.getElementById('message-box');
const messages = document.getElementById('messages');


socket.on('updatePlayers', (players) => {
 $('.players').empty();
 console.log(players);
  Object.keys(players).forEach((id) => {
    $('.players').append("<li><div class='player'><span>" + id + '</span><span>' + players[id].name + '</span><span>' + players[id].score + '</span><button onclick="removePlayer(\'' +id + '\')">Remove</button></div></li>');
  });
});


document.querySelectorAll('[data-command]').forEach((button) => {

  button.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(e.target.attributes['data-command'].value);
    socket.emit('startGame', e.target.attributes['data-command'].value);
  });
  
});


function clearPlayers() {
  console.log('Clearing players...');
  socket.emit('clearPlayers');
}

function getPlayers() {
  console.log('Getting players...');
  socket.emit('getPlayers');
}

function removePlayer(playerId) {
  console.log('Removing player ' + playerId);
  socket.emit('removePlayer', playerId);
}