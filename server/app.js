var GameManager = require('./serverjs/game_manager');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var users = {};
var gameManager = new GameManager(4);
// genTimestamp
// + new Date()
app.use(express.static('public'))
app.get('/', function(req, res){
  res.sendFile('index.html');
});
io.on('connection', function(socket){
  console.log('user ' + socket.id + ' connected');
  users[socket.id] = socket;
  socket.emit('setup', JSON.stringify(gameManager.serialize()));
  socket.on('disconnect', function(){
    console.log('user ' + socket.id + ' disconnected');
    delete users[socket.id];
  });
  socket.on('move',function(msg){
    console.log(msg);
    if(!gameManager.isGameTerminated()){
      gameManager.move(msg);
      socket.emit('actions',JSON.stringify([gameManager.actuate()]));
    }
  });
  socket.on('setup', function(){
    if(gameManager.isGameTerminated()){
      gameManager.restart();
      io.emit('setup', JSON.stringify(gameManager.serialize()));
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});