// App.tsx
import { RoomForm } from "./components/RoomForm";
import { Board } from "./components/Board";
import Footer from "./components/Footer";
import { useTicTacToe } from "./context/useTicTacToe";

function App() {
  const { isInRoom } = useTicTacToe();

  return (
    <>
      <div className="app">{!isInRoom ? <RoomForm /> : <Board />}</div>
      <Footer />
    </>
  );
}

export default App;
