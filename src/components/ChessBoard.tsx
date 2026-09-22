import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import ChessSquare from "./ChessSquare";
import DifficultySelector from "./DifficultySelector";
import PromotionSelector from "./PromotionSelector";
import {
  useStockfish,
  type StockfishDifficulty,
} from "../chess/useStockfish";

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

const pieceSymbols: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};



function ChessBoard() {
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] =
    useState<string | null>(null);

  const [gameHistory, setGameHistory] = useState<string[]>([]);

  const [difficulty, setDifficulty] =
    useState<StockfishDifficulty>("beginner");

  const [thinking, setThinking] = useState(false);

  const { ready, getBestMove } = useStockfish();

  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const [capturedByWhite, setCapturedByWhite] = useState<string[]>([]);

  const [capturedByBlack, setCapturedByBlack] = useState<string[]>([]);

  const [promotionSquare, setPromotionSquare] = useState<string | null>(
    null,
  );

  const legalMoves = useMemo(() => {
  if (!selectedSquare) {
    return [];
  }

  return game.moves({
    square: selectedSquare as any,
    verbose: true,
  }).map((move) => move.to);
}, [game, selectedSquare]);

  const makeComputerMove = async (currentGame: Chess) => {
    if (!ready || currentGame.isGameOver()) {
      return;
    }

    setThinking(true);

    const bestMove = await getBestMove(
      currentGame.fen(),
      difficulty,
    );

    if (!bestMove) {
      setThinking(false);
      return;
    }

    try {
      const newGame = new Chess(currentGame.fen());

      const computerMove = newGame.move({
        from: bestMove.slice(0, 2),
        to: bestMove.slice(2, 4),
        promotion:
          bestMove.length > 4
            ? bestMove[4] as "q" | "r" | "b" | "n"
            : undefined,
      });

      if (computerMove.captured) {
  setCapturedByBlack((captured) => [
    ...captured,
    computerMove.captured!,
  ]);
}

      setGame(newGame);
      setMoveHistory((history) => [...history, computerMove.san]);
    } catch (error) {
      console.error(
        "Could not apply Stockfish move:",
        error,
      );
    }

    setThinking(false);
  };

  const handleSquareClick = (square: string) => {
    if (thinking || game.isGameOver()) {
      return;
    }

    if (!ready) {
      return;
    }

    if (game.turn() !== "w") {
      return;
    }

    if (!selectedSquare) {
      const piece = game.get(square);

      if (piece?.color === "w") {
        setSelectedSquare(square);
      }

      return;
    }

    try {
      
      setGameHistory((history) => [
        ...history,
        game.fen(),
      ]);

      
      const newGame = new Chess(game.fen());

const movingPiece = newGame.get(selectedSquare as any);

if (
  movingPiece?.type === "p" &&
  ((movingPiece.color === "w" && square[1] === "8") ||
    (movingPiece.color === "b" && square[1] === "1"))
) {
  setPromotionSquare(square);
  return;
}

const playerMove = newGame.move({
  from: selectedSquare,
  to: square,
});

      if (playerMove.captured) {
        setCapturedByWhite((captured) => [
          ...captured,
          playerMove.captured!,
        ]);
      }   

      setGame(newGame);
      setSelectedSquare(null);
      setMoveHistory((history) => [...history,playerMove.san,]);

      if (!newGame.isGameOver()) {
        makeComputerMove(newGame);
      }
    } catch {
      const piece = game.get(square);

      if (piece?.color === "w") {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelectedSquare(null);
    setThinking(false);
    setMoveHistory([]);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setGameHistory([]);
  };

  const undoMove = () => {
    if (thinking || gameHistory.length === 0) {
      return;
    }

    const previousFen =
      gameHistory[gameHistory.length - 1];

    setGame(new Chess(previousFen));

    setGameHistory((history) =>
      history.slice(0, -1),
    );

    setSelectedSquare(null);
    setPromotionSquare(null);

    setMoveHistory((history) =>
      history.slice(0, -2),
    );
  };

  return (
    <div className="game-container">
      <DifficultySelector
        difficulty={difficulty}
        onChange={setDifficulty}
      />

      <div className="game-status">
  {!ready ? (
    "Starting chess engine..."
  ) : thinking ? (
    "Computer is thinking..."
  ) : game.isCheckmate() ? (
    game.turn() === "w"
      ? "Checkmate — Computer wins"
      : "Checkmate — You win"
  ) : game.isStalemate() ? (
    "Draw — Stalemate"
  ) : game.isThreefoldRepetition() ? (
    "Draw — Threefold repetition"
  ) : game.isInsufficientMaterial() ? (
    "Draw — Insufficient material"
  ) : game.isDraw() ? (
    "Draw"
  ) : game.inCheck() ? (
    game.turn() === "w"
      ? "Check — Your king is under attack"
      : "Check — Computer's king is under attack"
  ) : game.turn() === "w" ? (
    "Your turn"
  ) : (
    "Computer's turn"
  )}
</div>

      <div className="chess-board">
        {ranks.map((rank, rankIndex) =>
          files.map((file, fileIndex) => {
            const square = `${file}${rank}`;
            const piece = game.get(square);

            const isLight =
              (rankIndex + fileIndex) % 2 === 0;

            const pieceKey = piece
              ? `${piece.color}${piece.type.toUpperCase()}`
              : null;  
            const isKingInCheck =
              game.inCheck() &&
              piece?.type === "k" &&
              piece.color === game.turn();

            return (
              <ChessSquare
                key={square}
                square={square}
                piece={
                  pieceKey
                    ? pieceSymbols[pieceKey]
                    : null
                }
                pieceColor={
                  piece
                    ? piece.color === "w"
                      ? "white"
                      : "black"
                      : null
                }
                isLight={isLight}
                isSelected={
                  selectedSquare === square
                }
                isLegalMove={legalMoves.includes(square)}
                isInCheck={isKingInCheck}
                onClick={() =>
                  handleSquareClick(square)
                }
                 
              />
            );
          }),
        )}

        {promotionSquare && (
  <PromotionSelector
    color="white"
    onSelect={(piece) => {
      console.log("Selected promotion:", piece);
    }}
  />
)}

      </div>

     <div className="captured-pieces">
  <div>
    <strong>You captured:</strong>{" "}
    {capturedByWhite.length > 0
      ? capturedByWhite.map(
          (piece, index) => (
            <span key={`${piece}-${index}`}>
              {pieceSymbols[`b${piece.toUpperCase()}`]}{" "}
            </span>
          ),
        )
      : "None"}
  </div>

  <div>
    <strong>Computer captured:</strong>{" "}
    {capturedByBlack.length > 0
      ? capturedByBlack.map(
          (piece, index) => (
            <span key={`${piece}-${index}`}>
              {pieceSymbols[`w${piece.toUpperCase()}`]}{" "}
            </span>
          ),
        )
      : "None"}
  </div>
</div> 

      <div className="move-history">
  <h2>Move History</h2>

  <div className="moves">
    {Array.from(
      { length: Math.ceil(moveHistory.length / 2) },
      (_, index) => {
        const whiteMove = moveHistory[index * 2];
        const blackMove = moveHistory[index * 2 + 1];

        return (
          <div className="move-row" key={index}>
            <span className="move-number">
              {index + 1}.
            </span>

            <span className="white-move">
              {whiteMove ?? "—"}
            </span>

            <span className="black-move">
              {blackMove ?? "—"}
            </span>
          </div>
        );
      },
    )}
  </div>
</div>


      <div className="game-buttons">
  <button
    className="undo-button"
    onClick={undoMove}
    disabled={thinking || gameHistory.length === 0}
  >
    Undo Move
  </button>

  <button
    className="reset-button"
    onClick={resetGame}
  >
    New Game
  </button>
</div>
    </div>
  );
}

export default ChessBoard;