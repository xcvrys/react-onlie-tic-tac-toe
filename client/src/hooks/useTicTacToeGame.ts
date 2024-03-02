import {
  useEffect,
  useState,
} from "react";
import * as SocketIOClient from "socket.io-client";

export const useTicTacToeGame = (): TicTacToeGame => {
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isInRoom, setIsInRoom] = useState(false);
  const [disableMoves, setDisableMoves] = useState(false);
  const [messages, setMessages] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [vsComputer, setVsComputer] = useState(false);

  useEffect(() => {
    const newSocket = SocketIOClient.io(import.meta.env.VITE_BASE_URL);
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });
    newSocket.on("connect_error", () => {
      console.log("Failed to connect to server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    setErrorMessage(null);

    socket.on("room created", (newRoom: string) => {
      setRoom(newRoom);
      setSymbol("X");
      setIsInRoom(true);
      setDisableMoves(false);
    });

    socket.on("joined room", (data: { room: string; symbol: string }) => {
      setRoom(data.room);
      setSymbol(data.symbol);
      setIsInRoom(true);
      setDisableMoves(false);
    });

    socket.on("board updated", (newBoard: (string | null)[]) => {
      setBoard(newBoard);
    });

    socket.on("is in room", (value: boolean) => {
      setIsInRoom(value);
    });

    socket.on(
      "game over",
      ({
        winner,
        board,
      }: {
        winner: string | null;
        board: (string | null)[];
      }) => {
        if (winner === "tie") {
          setWinner("tie");
        } else if (winner) {
          setWinner(winner);
        }

        setBoard(board);
        setDisableMoves(true);
      }
    );

    socket.on("error", (errorMessage: string) => {
      setErrorMessage(errorMessage);
    });

    return () => {
      socket.off("room created");
      socket.off("joined room");
      socket.off("board updated");
      socket.off("is in room");
      socket.off("allow moves");
      socket.off("game over");
      socket.off("error");
    };
  }, [socket, board, setRoom, setErrorMessage]);

  const createRoom = (vsComputer: boolean = false) => {
    setVsComputer(vsComputer);
    if (socket) {
      socket.emit("create room", vsComputer);
    }
  };

  const joinRoom = (selectedRoom: string) => {
    if (socket) {
      socket.emit("join room", selectedRoom);
    }
  };

  const makeMove = (index: number, vsComputer: boolean) => {
    if (socket && room && symbol && board[index] === null && !disableMoves) {
      socket.emit("make move", room, index, vsComputer);
    }
  };

  const goBack = () => {
    setIsInRoom(false);
    setRoom(null);
    setSymbol(null);
    setBoard(Array(9).fill(null));
    setDisableMoves(false);
    setMessages(null);
    setErrorMessage(null);
    setWinner(null);
    setVsComputer(false);

    window.location.reload();
  };

  return {
    socket,
    symbol,
    board,
    isInRoom,
    createRoom,
    joinRoom,
    makeMove,
    goBack,
    disableMoves,
    room,
    setRoom,
    messages,
    setMessages,
    errorMessage,
    winner,
    vsComputer,
  };
};