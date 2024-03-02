import { useCallback, useState } from "react";
import { useTicTacToe } from "../context/useTicTacToe";

export const RoomForm = () => {
  const { createRoom, joinRoom, setRoom, errorMessage } = useTicTacToe();
  const [roomInput, setRoomInput] = useState("");
  const handleJoinRoom = useCallback(() => {
    joinRoom(roomInput);
    setRoom(roomInput);
  }, [joinRoom, setRoom, roomInput]);

  return (
    <>
      <img className="FormLogo" src="Tto.png" alt="Tic Tac Toe" />
      <button onClick={() => createRoom(false)}>Create Room vs human</button>
      <button onClick={() => createRoom(true)}>Create Room vc Computer</button>
      <p className="formOr">or</p>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomInput}
        className={errorMessage ? "errorInput" : ""}
        onChange={(e) => setRoomInput(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && handleJoinRoom()}
      />
      {errorMessage && <p className="error">{errorMessage}</p>}
      <button onClick={handleJoinRoom}>Join Room</button>
    </>
  );
};
