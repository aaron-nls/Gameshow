// client.js (inside public folder)

const socket = io('http://localhost:8080');
const form = document.getElementById('message-form');
const messageBox = document.getElementById('message-box');
const messages = document.getElementById('messages');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('message', messageBox.value);
  messageBox.value = '';
});

socket.on('updatePlayers', (players) => {
  
 $('.players').empty();
  Object.keys(players).forEach((name, score) => {
    $('.players').append("<li><div class='player'><span>" + name + '</span><span>' + score + '</span></div></li>');
  });
});


document.querySelectorAll('[data-command]').forEach((button) => {

  button.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(e.target.attributes['data-command'].value);
    socket.emit('gameStart', e.target.attributes['data-command'].value);
  });
  
});