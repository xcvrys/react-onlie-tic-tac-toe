const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

let rooms = {};

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('create room', (vsComputer) => {
    try {
      const room = generateRoomName();

      rooms[room] = {
        players: [socket.id],
        board: Array(9).fill(null),
        isFull: vsComputer,
        currentPlayer: 0,
        vsComputer,
      };

      socket.join(room);
      console.log(`Room created: ${room}`);
      socket.emit('room created', room);
      io.to(socket.id).emit('board updated', rooms[room].board);
      io.to(socket.id).emit('is in room', true);
    } catch (error) {
      console.error(error.message);
      socket.emit('room creation error');
    }
  });

  socket.on('join room', (room) => {
    if (!rooms[room]) {
      socket.emit('error', 'Room does not exist');
      return;
    }

    if (rooms[room].isFull) {
      socket.emit('error', 'Room is full');
      return;
    }

    rooms[room].players.push(socket.id);
    socket.join(room);

    const playerIndex = rooms[room].players.indexOf(socket.id);
    const symbol = playerIndex === 0 ? 'X' : 'O';

    rooms[room].currentPlayer = playerIndex;
    socket.emit('joined room', { room, symbol });

    io.to(socket.id).emit('board updated', rooms[room].board);
    io.to(socket.id).emit('is in room', true);

    if (rooms[room].players.length === 2) {
      rooms[room].isFull = true;
    }

    console.log(`User joined room: ${room}`);
    io.to(room).emit('board updated', rooms[room].board);
  });

  socket.on('make move', (room, index, vsComputer) => {
    if (!rooms[room]) {
      socket.emit('error', 'Room does not exist');
      return;
    }

    const playerIndex = rooms[room].players.indexOf(socket.id);
    if (playerIndex === -1) {
      socket.emit('error', 'You are not in this room');
      return;
    }

    if (playerIndex !== rooms[room].currentPlayer) {
      socket.emit('error', 'It is not your turn');
      return;
    }

    if (rooms[room].board[index] !== null) {
      socket.emit('error', 'This cell is already occupied');
      return;
    }

    const symbol = playerIndex === 0 ? 'X' : 'O';
    rooms[room].board[index] = symbol;

    rooms[room].currentPlayer = 1 - playerIndex;

    io.to(room).emit('board updated', rooms[room].board);

    const winner = calculateWinner(rooms[room].board);
    if (winner) {
      io.to(room).emit('game over', { winner, board: rooms[room].board });
    } else if (rooms[room].board.every(cell => cell !== null)) {
      io.to(room).emit('game over', { winner: 'tie', board: rooms[room].board });
    }


    if (vsComputer && !winner && rooms[room].currentPlayer === 1) {
      const computerIndex = findBestMove(rooms[room].board);
      rooms[room].board[computerIndex] = 'O';
      rooms[room].currentPlayer = 0;

      io.to(room).emit('board updated', rooms[room].board);

      const computerWinner = calculateWinner(rooms[room].board);
      if (computerWinner) {
        io.to(room).emit('game over', { winner: computerWinner, board: rooms[room].board });
      } else if (rooms[room].board.every(cell => cell !== null)) {
        io.to(room).emit('game over', { winner: 'tie', board: rooms[room].board });
      }
      console.log(
        `Computer made a move: ${computerIndex} in room: ${room}`,
        rooms[room].board,
      );
    }

    function findBestMove(board) {
      let bestScore = -Infinity;
      let bestMove;

      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          let score = minimax(board, 0, false);
          board[i] = null;

          if (score > bestScore) {
            bestScore = score;
            bestMove = i;
          }
        }
      }

      return bestMove;
    }

    function minimax(board, depth, isMaximizing) {
      let result = calculateWinner(board);
      if (result !== null) {
        return result === 'O' ? 1 : -1;
      }

      if (board.every(cell => cell !== null)) {
        return 0;
      }

      if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, depth + 1, false);
            board[i] = null;
            bestScore = Math.max(score, bestScore);
          }
        }
        return bestScore;
      } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
          if (board[i] === null) {
            board[i] = 'X';
            let score = minimax(board, depth + 1, true);
            board[i] = null;
            bestScore = Math.min(score, bestScore);
          }
        }
        return bestScore;
      }
    }
    // }
  });

  socket.on('clear all rooms', () => {
    rooms = {};
    console.log('All rooms cleared');
    io.emit('all rooms cleared');
  });

  socket.on('get rooms', () => {
    socket.emit('rooms', Object.keys(rooms));
    console.log('Rooms: ' + Object.keys(rooms));
  });


  socket.on('disconnect', () => {
    console.log('User disconnected');
    for (const room of Object.keys(rooms)) {
      const index = rooms[room].players.indexOf(socket.id);
      if (index !== -1) {
        rooms[room].players.splice(index, 1);
        if (rooms[room].players.length === 0) {
          delete rooms[room];
        } else if (rooms[room].players.length === 1) {
          rooms[room].isFull = false;
        }
      }
    }
  });
});

if (require.main === module) {
  const port = process.env.PORT || 3002;
  server.listen(port, () => console.log(`Server running on port ${port}`));
}


function calculateWinner(board) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}



function generateRandomRoomName() {
  const adjectives = ['Jolly', 'Silly', 'Cheeky', 'Whimsical', 'Zany', 'Hilarious', 'Playful', 'Amusing', 'Lively', 'Quirky', 'Wacky', 'Merry', 'Goofy', 'Eccentric', 'Joyful', 'Bubbly', 'Spontaneous', 'Peculiar', 'Jovial', 'Ludicrous', 'Gleeful', 'Absurd', 'Bonkers', 'Kooky', 'Witty', 'Vivacious', 'Lighthearted', 'Unpredictable', 'Fantastic'];
  const nouns = ['Penguin', 'Banana', 'Robot', 'Cupcake', 'Ninja', 'Giraffe', 'Squid', 'Mango', 'Wizard', 'Sunflower', 'Jellybean', 'Bubblegum', 'Thunderstorm', 'Unicorn', 'Pancake', 'Snickerdoodle', 'Moonlight', 'Sasquatch', 'Serenade', 'Giggles', 'Snuggle', 'Enigma', 'Mischief', 'Craze', 'Spectacle', 'Harmony', 'Bamboozle', 'Chuckle', 'Zigzag'];
  const roomTypes = ['Room', 'Cave', 'Den', 'Hideout', 'Lair', 'Nest', 'Sanctuary', 'Hangout', 'Haven', 'Retreat'];

  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomRoomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];

  return `${randomAdjective}-${randomNoun}-${randomRoomType}`;
}

function generateRoomName(attempt = 0, maxAttempts = 100) {
  if (attempt >= maxAttempts) {
    throw new Error('Maximum attempts reached for room name generation');
  }

  const room = generateRandomRoomName();

  if (rooms[room]) {
    return generateRoomName(attempt + 1, maxAttempts);
  }

  return room;
}

module.exports = { calculateWinner, generateRoomName, rooms };