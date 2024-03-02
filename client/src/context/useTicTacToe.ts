import { useContext } from "react";
import { TicTacToeContext } from "./TicTacToeContext";

export const useTicTacToe = () => {
  const contextValue = useContext(TicTacToeContext);
  if (!contextValue) {
    throw new Error("useTicTacToe must be used within a TicTacToeProvider");
  }
  return contextValue;
};