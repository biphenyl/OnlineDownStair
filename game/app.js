var socket = io.connect('http://luffy.ee.ncku.edu.tw:4395', {
  'force new connection': true
});
var intervalID;
var MAX_PLAYER = 20;

var my = {
  id: -1,
  name: '',
  x: 300,
  y: 300,
  vx: 0,
  vy: 0,
  hp: 20,
  score: 0,
  face: -1,
  keyState: 0,
  uuid: 0,
  time: 0,
  login: 0
};
var newPlatform = {
  x: 0,
  type: -1,
  uuid: 0
};
var name = '';

// update position
function posUpdate(obj) {
  // x, y, vx, vy, keyState
  var uuid = new Date().getTime();
  my.uuid = uuid;
  my.time = uuid;
  my.keyState = sentCharacters[my.id].keyState;
  socket.emit('sendAll', {
    name: sentCharacters[my.id].name,
    otherId: my.id,
    x: sentCharacters[my.id].x,
    y: sentCharacters[my.id].y,
    vx: sentCharacters[my.id].vx,
    vy: sentCharacters[my.id].vy,
    hp: sentCharacters[my.id].hp,
    score: sentCharacters[my.id].score,
    face: sentCharacters[my.id].face,
    keyState: sentCharacters[my.id].keyState,
    uuid: my.uuid 
  });
}
// dead
function iAmDead() {
  var uuid = new Date().getTime();
  my.uuid = uuid;
  my.hp = 0;
  my.keyState = sentCharacters[my.id].keyState;
  socket.emit('sendAll', {
    name: sentCharacters[my.id].name,
    otherId: my.id,
    x: sentCharacters[my.id].x,
    y: sentCharacters[my.id].y,
    vx: sentCharacters[my.id].vx,
    vy: sentCharacters[my.id].vy,
    hp: sentCharacters[my.id].hp,
    score: sentCharacters[my.id].score,
    face: sentCharacters[my.id].face,
    keyState: sentCharacters[my.id].keyState,
    uuid: my.uuid
  });
}

$(document).ready(function() {
  $('#refresh').hide();
  $('#maxPlayer').hide();
  $('#errorMsg').hide();
  $('#room').hide();
  $('#output').hide();
  socket.on('connect', function() {
    //clearInterval(intervalID);
    $('#sendid').click(function() {
      name = $('#username').val();
      socket.emit('login', name);
    });
    $('#username').keypress(function(e) {
      if (e.keyCode == 13) {
        e.preventDefault();
        name = $('#username').val();
        socket.emit('login', name);
      }
    });
  });
  // error username
  socket.on('wrong', function() {
    $('#errorMsg').show();
  });
  // max player
  socket.on('maxPlayer', function() {
    $('#maxPlayer').show();
  });
  // login
  socket.on('addMe', function(obj) {
    // newId, newName
    $('#login').hide();
    $('#errorMsg').hide();
    $('#room').show();
    $('#output').empty();
    $('#output').append(obj.newName + ' ' + obj.newId + '<br>');
    my.id = obj.newId;
    my.name = obj.newName;
    $('#room').append('<script type="text/javascript" src="game.js"></script>');
 
    console.log("your id is " + my.id);
    sentCharacters[my.id] = new sentCharacter();
    sentCharacters[my.id].name = obj.newName;
    playerList[my.id] = true;
    my.login = 1;
    var time = new Date().getTime();
    my.time = time;
    socket.emit('room');
  });
  // add other user
  socket.on('addUser', function(obj) {
    // newId, newName
    $('#output').empty();
    $('#output').append(obj.newName + ' ' + obj.newId + '<br>');
    sentCharacters[obj.newId] = new sentCharacter();
    sentCharacters[obj.newId].name = obj.newName;

    playerList[obj.newId] = true;

    socket.emit('sendState', {
      id: my.id,
      name: my.name,
      newId: obj.newId,
      x: my.x,
      y: my.y
    });
  });
  // let new player get other players' state
  socket.on('serverUpdateState', function(obj) {
    // id, name, newId, x, y
    if (my.id == obj.newId) {
      $('#output').empty();
      $('#output').append(obj.name + ' ' + obj.newId + ' ' + obj.x + ' ' + obj.y + '<br>');
      sentCharacters[obj.id] = new sentCharacter();
      sentCharacters[obj.id].x = obj.x;
      sentCharacters[obj.id].y = obj.y;
      sentCharacters[obj.id].name = obj.name;

      playerList[obj.id] = true;
    }
  });

  // get other players' state
  socket.on('serverUpdateAll', function(obj) {
    // name, otherId, x, y, vx, vy, hp, score, face
    $('#output').empty();
    $('#output').append(obj.name + ' ' + obj.otherId + ' ' + obj.x + ' ' + obj.y + ' ' + obj.vx + ' ' + obj.vy + ' ' + obj.hp + ' ' + obj.score + ' ' + obj.face + '<br>');
    //console.log("we doing " + obj.otherId + "and player list is" + playerList[obj.otherId]);

    sentCharacters[obj.otherId].x = obj.x;
    sentCharacters[obj.otherId].y = obj.y;
    sentCharacters[obj.otherId].vx = obj.vx;
    sentCharacters[obj.otherId].vy = obj.vy;
    sentCharacters[obj.otherId].hp = obj.hp;
    sentCharacters[obj.otherId].score = obj.score;
    sentCharacters[obj.otherId].face = obj.face;
    sentCharacters[obj.otherId].keyState = obj.keyState;
    sentCharacters[obj.otherId].uuid = obj.uuid;
  });

  // server sync
  socket.on('serverSync', function() {
    var uuid = new Date().getTime();
    my.uuid = uuid;
    //console.log("other id is " + my.id);
    socket.emit('sendAll', {
      name: sentCharacters[my.id].name,
      otherId: my.id,
      x: sentCharacters[my.id].x,
      y: sentCharacters[my.id].y,
      vx: sentCharacters[my.id].vx,
      vy: sentCharacters[my.id].vy,
      hp: sentCharacters[my.id].hp,
      score: sentCharacters[my.id].score,
      face: sentCharacters[my.id].face,
      keyState: sentCharacters[my.id].keyState,
      uuid: my.uuid
    });
  });
  // clean zombie
  socket.on('serverClean', function() {
    socket.emit('clean');
  });
  // check timeout
  socket.on('serverCheck', function() {
    var time = new Date().getTime();  
    if (my.login == 1) {
      if ((time - my.time) > 5000 && sentCharacters[my.id].keyState == 0) {
        socket.emit('timeout');
        $('#room').hide();
        $('#refresh').show();
      } 
    }
  });
  // server update platform
  socket.on('serverNewPlatform', function(obj) {
    newPlatform.x = obj.x;
    newPlatform.type = obj.type;
    newPlatform.uuid += 1;
    //console.log("get a platform at " + new Date().getTime());
  });
  // leave
  socket.on('leave', function(obj) {
    //id, name
    $('#output').empty();
    $('#output').append(obj.name + ' ' + obj.id + ' logout<br>');
    playerList[obj.id] = false;
  });
});
