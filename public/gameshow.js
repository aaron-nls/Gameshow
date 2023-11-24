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

socket.on('message', (message) => {
  const li = document.createElement('li');
  li.textContent = message;
  messages.appendChild(li);
});


document.querySelectorAll('[data-command]').forEach((button) => {

  button.addEventListener('click', (e) => {
    e.preventDefault();
    console.log(e.target.attributes['data-command'].value);
    socket.emit('gameStart', e.target.attributes['data-command'].value);
  });
  
});