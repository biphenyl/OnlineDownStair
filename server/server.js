#!/usr/local/bin/node

var every_c = require('schedule').every;
var every_s = require('schedule').every;
var every_p = require('schedule').every;
var every_t = require('schedule').every;
var fs = require('fs');
var express = require('express');
var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(4395);

app.get('/', function(req, res) {
  res.sendFile('index.html', {'root': '/home/wp2016/user/johnnylin12/git/OnlineDownStair/game'});
});
app.use(express.static('/home/wp2016/user/johnnylin12/git/OnlineDownStair/game/'));
var MAX_PLAYER = 50;
var MAX_ROOM = 2;
var MAX_X = 1700;
var MAX_TYPE = 5;
var platformWidth = 320;
var id = new Array(MAX_ROOM);
for (i = 0; i < MAX_ROOM; i++) {
  id[i] = new Array(MAX_PLAYER).fill(0);
}
var oldX = new Array(MAX_ROOM).fill(0);
var maxp = new Array(MAX_ROOM).fill(0);
var errorList = ['\t', '\u0000', '\u0009','\u0020', '\u00A0', '\u1680', '\u180E',
                '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005',
                '\u2006', '\u2007', '\u2008', '\u2009', '\u200A', '\u200B',
                '\u202F', '\u205F', '\u3000', '\uFEFF', '\u000A', '\u000B',
                '\u000C', '\u000D', '\u000D\u000A', '\u0085', '\u2028', '\u2029'];

function getID(room) {
  for (i = 0; i < MAX_PLAYER; i++) {
    if (id[room][i] == 0) {
      id[room][i] = 1;
      return i;
    }
  }
}

io.on('connection', function(socket) {
  var clientIp = socket.request.connection.remoteAddress;
  var d = new Date();
  var date = d.toDateString();
  var time = d.toTimeString();
  var msg = '[' + time + ' ' + date + '] [' + clientIp + '] New connection';
  fs.appendFile('server.log', msg + '\n', 'utf8', function(err) {
    if (err) throw err;
    console.log(msg);
  });
  // send number of players
  socket.emit('number', maxp);
  // check username
  socket.on('login', function(obj) {
    var flag = 0;
    var room = parseInt(obj.room);
    for (i = 0; i < errorList.length; i++) {
      if (obj.name.indexOf(errorList[i]) != -1) {
        flag = 1;
        break;
      }
    }
    // error
    if (obj.name.length > 10 || obj.name.length == 0 || flag == 1) {
      socket.emit('wrong');
    }
    // correct
    if (obj.name.length <= 10 && obj.name.length > 0 && flag == 0) {
      maxp[room] += 1;
      if (maxp[room] >= MAX_PLAYER) {
        socket.emit('maxPlayer');
      }else {
        var i = getID(room);
        var d = new Date();
        var date = d.toDateString();
        var time = d.toTimeString();
        var msg = '[' + time + ' ' + date + '] [' + clientIp + '] ' + obj.name + '[' + i + '] login';
        fs.appendFile('server.log', msg + '\n', 'utf8', function(err) {
          if (err) throw err;
          console.log(msg);
        });
        socket.username = obj.name;
        socket.userid = i;
        socket.userroom = obj.room;
        socket.join(socket.userroom);
        socket.emit('addMe', {
          newId: i,
          newName: obj.name
        });
        socket.broadcast.to(socket.userroom).emit('addUser', {
          newId: i,
          newName: obj.name
        });
      }
    }
  });
  // join the game
  socket.on('room', function() {
    socket.join(socket.userroom);
  });
  // send player's data
  socket.on('sendAll', function(data) {
    //console.log(data);
    socket.broadcast.to(socket.userroom).emit('serverUpdateAll', {
      name: socket.username,
      otherId: socket.userid,
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
    socket.broadcast.to(socket.userroom).emit('serverUpdateState', {
      id: socket.userid,
      name: socket.username,
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
    if (socket.userid === undefined || socket.username === undefined || socket.userroom === undefined) {
      socket.disconnect();
    }
  });
  // logout
  socket.on('disconnect', function() {
    socket.broadcast.to(socket.userroom).emit('leave', {
      id: socket.userid,
      name: socket.username
    });
    var room = parseInt(socket.userroom);
    if (room != undefined && socket.userid != undefined) {
      id[room][socket.userid] = 0;
      maxp[room] -= 1;
    }
    var d = new Date();
    var date = d.toDateString();
    var time = d.toTimeString();
    var msg = '[' + time + ' ' + date + '] [' + clientIp + '] ' + socket.username + '[' + socket.userid + '] logout';
    fs.appendFile('server.log', msg + '\n', 'utf8', function(err) {
      if (err) throw err;
      console.log(msg);
    });
  });
});
// clean cycle
every_c('1s').do(function() {
  for (i = 0; i < MAX_ROOM; i++)
    io.in(i.toString()).emit('serverClean');
});
// sync cycle
every_s('10s').do(function() {
  for (i = 0; i < MAX_ROOM; i++)
    io.in(i.toString()).emit('serverSync');
});
// timeout cycle
every_t('5s').do(function() {
  for (i = 0; i < MAX_ROOM; i++)
    io.in(i.toString()).emit('serverCheck');
});
// new platform cycle
every_p('800ms').do(function() {
  for (i = 0; i < MAX_ROOM; i++) {
    var x = Math.floor(Math.random() * (MAX_X + 1));
    while (x >= oldX[i] - platformWidth && x <= oldX[i] + platformWidth) {
      x = Math.floor(Math.random() * (MAX_X + 1));
    }
    oldX[i] = x;
    var type = Math.floor(Math.random() * MAX_TYPE);
    io.in(i.toString()).emit('serverNewPlatform', {
      x: x,
      type: type
    });
  }
});
