import { useTicTacToeGame } from "../hooks/useTicTacToeGame";
import { TicTacToeContext } from "./TicTacToeContext";

export const TicTacToeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const contextValue = useTicTacToeGame();

  return (
    <TicTacToeContext.Provider value={contextValue}>
      {children}
    </TicTacToeContext.Provider>
  );
};
