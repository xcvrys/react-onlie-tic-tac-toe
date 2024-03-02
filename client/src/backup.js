// import React, { useEffect, useState } from "react";
// import * as SocketIOClient from "socket.io-client";

// interface BoardProps {
//   squares: (string | null)[];
//   onClick: (index: number) => void;
// }

// const Board: React.FC<BoardProps> = ({ squares, onClick }) => {
//   return (
//     <div className="board">
//       {squares.map((value, index) => (
//         <div key={index} className="square" onClick={() => onClick(index)}>
//           {value}
//         </div>
//       ))}
//     </div>
//   );
// };

// interface AppProps {}

// const App: React.FC<AppProps> = () => {
//   const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
//   const [room, setRoom] = useState<string | null>(null);
//   const [symbol, setSymbol] = useState<string | null>(null);
//   const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
//   const [isInRoom, setIsInRoom] = useState(false);
//   const [disableMoves, setDisableMoves] = useState(false);
//   const [isRoundOver, setIsRoundOver] = useState(false);

//   useEffect(() => {
//     const newSocket = SocketIOClient.io(import.meta.env.VITE_BASE_URL);
//     newSocket.on("connect", () => {
//       console.log("Connected to server", newSocket);
//     });
//     newSocket.on("connect_error", () => {
//       console.log("Failed to connect to server");
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on("room created", (newRoom: string) => {
//       setRoom(newRoom);
//       setSymbol("X");
//       setIsInRoom(true);
//       setDisableMoves(false);
//     });

//     socket.on("joined room", (data: { room: string; symbol: string }) => {
//       setRoom(data.room);
//       setSymbol(data.symbol);
//       setIsInRoom(true);
//       setDisableMoves(false);
//     });

//     socket.on("board updated", (newBoard: (string | null)[]) => {
//       setBoard(newBoard);
//     });

//     socket.on("is in room", (value: boolean) => {
//       setIsInRoom(value);
//     });

//     socket.on(
//       "game over",
//       ({
//         winner,
//         board,
//       }: {
//         winner: string | null;
//         board: (string | null)[];
//       }) => {
//         if (winner === "tie") {
//           alert("It's a draw!");
//         } else if (winner) {
//           alert(`Player ${winner} wins!`);
//         }

//         setIsRoundOver(true);
//         setBoard(board);
//         setDisableMoves(true);
//       }
//     );

//     socket.on("error", (errorMessage: string) => {
//       console.error(errorMessage);
//     });

//     return () => {
//       socket.off("room created");
//       socket.off("joined room");
//       socket.off("board updated");
//       socket.off("is in room");
//       socket.off("allow moves");
//       socket.off("game over");
//       socket.off("error");
//     };
//   }, [socket, board]);

//   const createRoom = () => {
//     if (socket) {
//       socket.emit("create room");
//     }
//   };

//   const joinRoom = (selectedRoom: string) => {
//     if (socket) {
//       socket.emit("join room", selectedRoom);
//     }
//   };

//   const makeMove = (index: number) => {
//     if (socket && room && symbol && board[index] === null && !disableMoves) {
//       socket.emit("make move", room, index);
//     }
//   };

//   return (
//     <div className="app">
//       <h1>Tic Tac Toe</h1>
//       {!isInRoom && (
//         <>
//           <button onClick={createRoom}>Create Room</button>
//           <p>or</p>
//           <input
//             type="text"
//             placeholder="Enter Room ID"
//             onChange={(e) => setRoom(e.target.value)}
//           />
//           <button onClick={() => joinRoom(room || "")}>Join Room</button>
//         </>
//       )}
//       {isInRoom && room && (
//         <>
//           <p>Room ID: {room}</p>
//           <Board squares={board} onClick={makeMove} />
//           <p>Your Symbol: {symbol}</p>
//           {isRoundOver && <button>Back</button>}
//         </>
//       )}
//     </div>
//   );
// };

// export default App;







