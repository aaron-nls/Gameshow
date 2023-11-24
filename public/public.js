// client.js (inside public folder)

const socket = io('http://localhost:8080');
const form = document.getElementById('message-form');
const messageBox = document.getElementById('message-box');
const messages = document.getElementById('messages');

// form.addEventListener('submit', (e) => {
//   e.preventDefault();
//   socket.emit('message', messageBox.value);
//   messageBox.value = '';
// });

socket.on('message', (message) => {
  const li = document.createElement('li');
  li.textContent = message;
  messages.appendChild(li);
});

socket.on('gameStart', (game) => {
  document.querySelectorAll('.game').forEach((gameDiv) => {
    gameDiv.classList.remove('active');
  });

  document.querySelector('#' + game).classList.add('active');
});