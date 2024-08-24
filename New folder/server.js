const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // React app runs on port 3000
    methods: ["GET", "POST"]
  }
});

app.use(cors());

let users = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('registerUser', (username) => {
    users[socket.id] = username;
    console.log`(${username} has connected.);`
  });

  socket.on('sendMessage', ({ message, to }) => {
    const recipientSocketId = Object.keys(users).find(id => users[id] === to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('receiveMessage', { message, from: users[socket.id] });
    }
  });

  socket.on('disconnect', () => {
    console.log`(${users[socket.id]} has disconnected.);`
    delete users[socket.id];
  });
});

server.listen(4000, () => {
  console.log('Server listening on port 4000');
});