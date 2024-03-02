import { useTicTacToeGame } from "../hooks/useTicTacToeGame";

export const GameOverButton = () => {
  const { goBack } = useTicTacToeGame();

  return (
    <div>
      <button onClick={goBack}>Back</button>
    </div>
  );
};
