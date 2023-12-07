// client.js (inside public folder)

const socket = io('http://localhost:8080');
const form = document.getElementById('message-form');
const messageBox = document.getElementById('message-box');
const messages = document.getElementById('messages');
let buzzerPlayer = null

socket.on('updatePlayers', (players) => {
 $('.players').empty();
 console.log(players);
  Object.keys(players).forEach((id) => {
    $('.players').append("<li><div class='player'><span>" + id + '</span><span>' + players[id].name + '</span><span>' + players[id].score + '</span><span>Team ' + players[id].team + '</span><button onclick="switchTeam(\'' +id + '\')">Switch Team</button> <button onclick="removePlayer(\'' +id + '\')">Remove</button><button onclick="addPoints(\'' +id + '\')">Add Points</button></div></li>');
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
function nextScreen() {
  console.log('Next Screen');
  socket.emit('nextScreen');
}
function addPoints(playerId) {
  console.log('Adding points to ' + playerId);
  socket.emit('addPoints', playerId);
}
function switchTeam(playerId) {
  console.log('Switching team for ' + playerId);
  socket.emit('switchTeam', playerId);
}
function correctBuzz() {
  console.log('Correct buzzer ');
  if(!buzzerPlayer) return;
  socket.emit('correctBuzz', buzzerPlayer);
  buzzerPlayer = null;
}
function wrongBuzz() {
  console.log('Wrong buzzer ');
  if(!buzzerPlayer) return;
  socket.emit('wrongBuzz', buzzerPlayer);
  buzzerPlayer = null;
}



socket.on('updateBuzzerPlayer', (playerId) => {
  buzzerPlayer= playerId;
});