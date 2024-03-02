interface TicTacToeGame {
  socket: SocketIOClient.Socket;
  symbol: string | null;
  board: (string | null)[];
  isInRoom: boolean;
  createRoom: (vsComputer: boolean) => void;
  joinRoom: (selectedRoom: string) => void;
  makeMove: (index: number, vsComputer: boolean) => void;
  goBack: () => void;
  disableMoves: boolean;
  room: string | null;
  setRoom: React.Dispatch<React.SetStateAction<string | null>>;
  messages: string | null;
  setMessages: React.Dispatch<React.SetStateAction<string | null>>;
  errorMessage: string | null;
  messages: string | null;
  winner: string | null;
  vsComputer: boolean;
}