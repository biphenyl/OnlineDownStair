#!/usr/local/bin/node

var every_c = require('schedule').every;
var every_s = require('schedule').every;
var every_p = require('schedule').every;
var every_t = require('schedule').every;
var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(4395);

app.get('/', function(req, res) {
  res.sendFile('../game/' + 'index.html');
});
app.use(express.static('../game/'));
var MAX_PLAYER = 20;
var MAX_X = 1700;
var MAX_TYPE = 5;
var platformWidth = 320;
var id = new Array(MAX_PLAYER).fill(0);
var oldX = 0;
var errorList = [' ', '　', '\r', '\n', '\r\n', '\u00A0'];
var maxp = 0;

function getID() {
  for (i = 0; i < MAX_PLAYER; i++) {
    if (id[i] == 0) {
      id[i] = 1;
      return i;
    }
  }
}

io.on('connection', function(socket) {
  // check username
  socket.on('check', function(name) {
    var flag = 0;
    for (i = 0; i < errorList.length; i++) {
      if (name.indexOf(errorList[i]) != -1) {
        flag = 1;
        break;
      }
    }
    // error
    if (name.length > 10 || name.length == 0 || flag == 1) {
      socket.emit('serverCheck', 0);
    }
    // correct
    if (name.length <= 10 && name.length > 0 && flag == 0) {
      socket.emit('serverCheck', 1);
    }
  });
  // login
  socket.on('login', function(name) {
    maxp += 1;
    if (maxp >= MAX_PLAYER) {
      socket.emit('maxPlayer');
    }else {
      var i = getID();
      console.log(name + '[' + i + '] login');
      socket.username = name;
      socket.userid = i;
      socket.emit('addMe', {
        newId: i,
        newName: name
      });
      socket.broadcast.emit('addUser', {
        newId: i,
        newName: name
      });
    }
  });
  // join the game
  socket.on('room', function() {
    socket.join('game');
  });
  // send player's data
  socket.on('sendAll', function(data) {
    //console.log(data);
    socket.broadcast.to('game').emit('serverUpdateAll', {
      name: data.name,
      otherId: data.otherId,
      x: data.x,
      y: data.y,
      vx: data.vx,
      vy: data.vy,
      hp: data.hp,
      score: data.score,
      face: data.face,
      keyState: data.keyState,
      uuid: data.uuid
    });
  });
  // new player send data to other player
  socket.on('sendState', function(data) {
    socket.broadcast.emit('serverUpdateState', {
      id: data.id,
      name: data.name,
      newId: data.newId,
      x: data.x,
      y: data.y
    });
  });
  // timeout
  socket.on('timeout', function() {
    socket.disconnect();
  });
  // clean
  socket.on('clean', function() {
    if (socket.userid === undefined || socket.username === undefined) {
      socket.disconnect();
    }
  });
  // logout
  socket.on('disconnect', function() {
    socket.broadcast.to('game').emit('leave', {
      id: socket.userid,
      name: socket.username
    });
    id[socket.userid] = 0;
    if (maxp > 0) {
      maxp -= 1;
    }
    console.log(socket.username + '[' + socket.userid + '] logout');
  });
});
// clean cycle
every_c('1s').do(function() {
  io.in('game').emit('serverClean');
});
// sync cycle
every_s('5s').do(function() {
  io.in('game').emit('serverSync');
});
// timeout cycle
every_t('5s').do(function() {
  io.in('game').emit('serverCheck');
});
// new platform cycle
every_p('800ms').do(function() {
  var x = Math.floor(Math.random() * (MAX_X + 1));
  while (x >= oldX - platformWidth && x <= oldX + platformWidth) {
    x = Math.floor(Math.random() * (MAX_X + 1));
  }
  oldX = x;
  var type = Math.floor(Math.random() * MAX_TYPE);
  io.in('game').emit('serverNewPlatform', {
    x: x,
    type: type
  });
});
