// client.js (inside public folder)

const socket = io('http://localhost:8080');
let playerId = null;
let gamePosition = null;


$(document).ready(function() { 
  checkIfSessionExists();

  $(document).on('click', '.answers button', function(e) {
    $('page:visible .answers button').addClass('disabled');
    $(this).addClass('selected');
    let correct = $(this).attr('data-correct') == 'true' ? 1 : 0;
    socket.emit('submitAnswer', {'playerId': playerId, 'correct': correct});
  });

  $(document).on('input', '.answers input[type="range"]', function(e) {
    $('page:visible .sliderTotal').html($(this).val());
    console.log($(this).val());
  });
  
  $(document).on('click', '.answers.sliders a.btn', function(e) {
    $('page:visible .answers input').attr('disabled', true);
    
    let correct = $('page:visible .answers .sliderCorrect').html() ==  $('page:visible .answers .sliderTotal').html() ? 1 : 0;
    socket.emit('submitAnswer', {'playerId': playerId, 'correct': correct});
  });
});

function checkIfSessionExists() {
  console.log('Checking if session exists...');
  if (localStorage.getItem('playerId')) {
    playerId = localStorage.getItem('playerId');
    socket.emit('checkPlayer', playerId);
    return true;
  }
  
  changeGame('playerName', 0);
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

  
  let enterFunction = $('game:visible').attr('data-enter');

  if(enterFunction) {
    window[enterFunction]();
  }
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
socket.on('gameStart', (newGamePosition) => {
  gamePosition = newGamePosition;
  changeGame(gamePosition.game, gamePosition.screen);
});

/* Game Update */
socket.on('gameUpdateforPlayer', (newGamePosition) => {
  if(playerId == newGamePosition.playerId) {
    console.log('Game update received: ' + newGamePosition.game + ' - ' + newGamePosition.screen);
    if(!gamePosition || newGamePosition.game !== gamePosition.game || newgamePosition.screen !== gamePosition.screen) {
      gamePosition = newGamePosition;
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
/* Game Update */
socket.on('changeScreen', (screen) => {
  console.log('Game screen received: ' + screen);
  if(gamePosition.screen !== screen) {
    gamePosition.screen = screen;
    changeScreen(screen)
  }
});

/* reveal answer */
socket.on('revealAnswer', () => {
    $('page:visible .answers').addClass('reveal');
});


socket.on('playerCheck', (verification) => {
  console.log('Player check received: ' + verification.playerId + ' - ' + verification.playerExists);
  if(playerId == verification.playerId) {
    if(verification.playerExists == false){
      console.log('Player does not exist');
      playerId = null;
      localStorage.removeItem('playerId');
      changeGame('playerName', 0);
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
    socket.emit('addPlayer', {'name': playerName, 'team': 1, 'id': playerId});
  });

 }
}

function generateGame(){
  if(!gamePosition.json) {
    socket.emit('getGameforPlayer', playerId);
    return;
  }

  $.each(gamePosition.json, function(index, screen) {

    createScreen(index);

    switch(screen.question.type) {
      case 'text':
        createTextQuestion(index, screen.question);
        break;
      case 'image':
        createImageQuestion(index, screen.question);
        break;
      case 'buzzer':
        createBuzzerQuestion(index, screen.question);
        break;
      default:
        console.log('Error');
    }

    
    switch(screen.answers['1'].type) {
      case 'text':
        createTextAnswers(index, screen.answers);
        break;
      case 'image':
        createImageAnswers(index, screen.answers);
        break;
      case 'slider':
        createSliderAnswers(index, screen.answers);
        break;
      default:
        console.log('Error');
    }
  });
  console.log('Generating game...');


}

function createScreen(index) {
  if($('#' + gamePosition.game + ' screen[data-id="'+index+'"]').length == 0) { 
    $('#' + gamePosition.game).append('<screen data-id="' + index + '"><page data-id="0"></page></screen>');
  }
}


function createTextQuestion(index, question) {
  if($('#' + gamePosition.game + ' screen[data-id="'+index+'"] page h1').length == 0) { 
    $('#' + gamePosition.game + ' screen[data-id="'+index+'"] page').append('<h1 class="animate__slideInLeft animate__animated"><span>' + index + '.</span> ' + question.content + '</h1>');
  }
}

function createTextAnswers(index, answers) {
  let currentScreen = $('#' + gamePosition.game + ' screen[data-id="'+index+'"] page');

  if($(currentScreen).find('ul').length !== 0) {
    return;
  }

  $(currentScreen).append('<ul class="answers"></ul>');

  $.each(answers, function(index, answer) {
    $(currentScreen).find('ul').append('<li class="animate__animated animate__zoomIn animate__delay-'+index+'s"><button class="btn" data-correct="' + answer.correct + '">' + answer.content + '</button>');
  });
}

function createSliderAnswers(index, answers) {
  let currentScreen = $('#' + gamePosition.game + ' screen[data-id="'+index+'"] page');

  if($(currentScreen).find('input[type="range"]').length !== 0) {
    return;
  }
  let middle = Math.round((answers[1].max - (answers[1].min)) / 2);
  $(currentScreen).append('<div class="answers sliders"><div class="slider"><span>'+ answers[1].min +'</span><input type="range" min="'+ answers[1].min +'" max="'+ answers[1].max +'" value="'+ middle +'" /><span>'+ answers[1].max +'</span></div><div class="sliderTotal">'+ middle +'</div><div class="sliderCorrect">'+answers[1].correct+'</div><a class="btn">Submit</a></div>');
}