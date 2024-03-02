const { createServer } = require('http');
const { Server } = require('socket.io');
const { calculateWinner, generateRoomName, rooms } = require('./index');

const ioc = require('socket.io-client');

describe("Socket Tic Tac Toe Game", () => {
  let io, clientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      clientSocket = ioc(`http://localhost:3001`);
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  afterEach(() => {
    clientSocket.emit("clear all rooms");
    Object.keys(rooms).forEach((room) => {
      delete rooms[room];
    });
  });

  describe("Creatin Room", () => {
    test("should create a room", (done) => {
      clientSocket.emit("create room");

      clientSocket.on("room created", (room) => {
        expect(room).toBeTruthy();
        done();
      });
    });

    test("should create a 100 rooms without repeating unique names", (done) => {
      const roomNames = new Set();

      for (let i = 0; i < 100; i++) {
        clientSocket.emit("create room");
      }

      clientSocket.on("room created", (room) => {
        roomNames.add(room);
        if (roomNames.size === 100) {
          expect(roomNames.size).toBe(100);
          done();
        }
      });
    });


    test("should join a room", (done) => {
      clientSocket.emit("create room");

      clientSocket.on("room created", (room) => {
        clientSocket.emit("join room", room);
      });

      clientSocket.on("is in room", (isInRoom) => {
        expect(isInRoom).toBeTruthy();
        done();
      });
    });
  });

  describe("Joining Room", () => {

    test("should join a room", (done) => {
      clientSocket.emit("create room");

      clientSocket.on("room created", (room) => {
        clientSocket.emit("join room", room);
      });

      clientSocket.on("is in room", (isInRoom) => {
        expect(isInRoom).toBeTruthy();
        done();
      });
    });

    test("should join a room and get the symbol", (done) => {
      clientSocket.emit("create room");

      clientSocket.on("room created", (room) => {
        clientSocket.emit("join room", room);
      });

      clientSocket.on("joined room", (data) => {
        expect(data).toHaveProperty("room");
        expect(data).toHaveProperty("symbol");
        done();
      });
    });

    test("should join a room and get the board", (done) => {
      clientSocket.emit("create room");

      clientSocket.once("room created", (room) => {
        clientSocket.emit("join room", room);
      });

      clientSocket.once("board updated", (board) => {
        expect(board).toEqual(Array(9).fill(null));
        done();
      });
    });
  });

  describe("Playing Game", () => {
    /*
    * 
    * I really wanted to test the game play but:
    * https://i.imgur.com/gTWlHre.png
    * I honestly didn't sleep all night to fix it but I couldn't
    * 
    */
  });
});


describe('CalculateWinner', () => {
  it('should return X as the winner when X has a winning combination', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'O', 'X'];
    expect(calculateWinner(board)).toBe('X');
  });

  it('should return O as the winner when O has a winning combination', () => {
    const board = ['O', 'X', 'X', 'O', 'O', 'X', 'O', 'X', 'O'];
    expect(calculateWinner(board)).toBe('O');
  });

  it('should return null when there is no winner', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', null];
    expect(calculateWinner(board)).toBe(null);
  });

  it('should return null when the board is empty', () => {
    const board = Array(9).fill(null);
    expect(calculateWinner(board)).toBe(null);
  });

  it('should return null when the board is full and there is no winner', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
    expect(calculateWinner(board)).toBe(null);
  });

  it('should return null when the board is full and there is a draw', () => {
    const board = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
    expect(calculateWinner(board)).toBe(null);
  });

  it('should handle an empty array', () => {
    const board = [];
    expect(calculateWinner(board)).toBe(null);
  });

  it('should handle an array with less than 9 elements', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X'];
    expect(calculateWinner(board)).toBe(null);
  });

  it('should handle an array with more than 9 elements', () => {
    const board = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O', 'X'];
    expect(calculateWinner(board)).toBe(null);
  });
});

describe('generateRoomName', () => {
  it('should generate a random room name', () => {
    const roomName = generateRoomName();
    expect(roomName).toBeDefined();
  });

  it('should generate a room name with the format "adjective-noun-roomType"', () => {
    const roomName = generateRoomName();
    const parts = roomName.split('-');
    expect(parts.length).toBe(3);
  });
});