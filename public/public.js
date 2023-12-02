// client.js (inside public folder)

const socket = io('http://localhost:8080');

$(document).ready(function() {
  
  /* Submit Player Name */ 
  $('.addPlayer').click(function() {
    changeScreen('2');
    socket.emit('addPlayer', $('.playerName').val());
  });

});

/* Change Screen */

function changeScreen(screen) {
  $('game:visible .screen').removeClass('active');
  $('game:visible .screen[data-id="' + screen + '"]').addClass('active');
}

/* Game Changer */
socket.on('gameStart', (game) => {
  document.querySelectorAll('.game').forEach((gameDiv) => {
    gameDiv.classList.remove('active');
  });

  document.querySelector('#' + game).classList.add('active');
});
