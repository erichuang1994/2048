var GameManager = require('./serverjs/game_manager');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var users = {};
var gameManager = new GameManager(4, users);

app.use(express.static('public'))
app.get('/', function(req, res){
  res.sendFile('index.html');
});
io.on('connection', function(socket){
  console.log('user ' + socket.id + ' connected');
  // add socket to users
  users[socket.id] = socket;

  // Initial client
  socket.emit('setup', JSON.stringify(gameManager.serialize()));

  // delete socket when disconnect
  socket.on('disconnect', function(){
    console.log('user ' + socket.id + ' disconnected');
    delete users[socket.id];
  });

  // Move event
  socket.on('move',function(msg){
    console.log(msg);
    state = JSON.parse(msg);
    if(!gameManager.isGameTerminated()){
      if(state.timestamp === gameManager.timestamp){
        gameManager.move(state.direction);
        io.emit('act',JSON.stringify(gameManager.actuate()));
      }else{
        // actions lost synchronous
        console.log("actions lost");
        socket.emit('actions', JSON.stringify(gameManager.getActions(state.timestamp)));
      }
    }
  });

  // Restart event
  socket.on('restart', function(){
    if(gameManager.isGameTerminated()){
      gameManager.restart();
      io.emit('setup', JSON.stringify(gameManager.serialize()));
      console.log('[info]:'+'setup');
    }
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
