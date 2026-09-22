interface ChessSquareProps {
  square: string;
  piece: string | null;
  pieceColor: "white" | "black" | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  onClick: () => void;
  isInCheck: boolean;
}

function ChessSquare({
  square,
  piece,
  pieceColor,
  isLight,
  isSelected,
  isLegalMove,
  onClick,
  isInCheck,
}: ChessSquareProps) {
  const file = square[0];
  const rank = square[1];

  const showFile = rank === "1";
  const showRank = file === "a";

  return (
    <button
      type="button"
      className={`chess-square ${isLight ? "light" : "dark"} ${
        piece?.includes("♔") ||
        piece?.includes("♕") ||
        piece?.includes("♖") ||
        piece?.includes("♗") ||
        piece?.includes("♘") ||
        piece?.includes("♙")
          ? "white-piece"
          : "black-piece"
      } ${
        isSelected ? "selected" : ""
      } ${isLegalMove ? "legal-move" : ""} ${
        isInCheck ? "in-check" : ""
      }`}
      onClick={onClick}
      aria-label={`Chess square ${square}`}
    >
      {showRank && (
        <span className="rank-label">
          {rank}
        </span>
      )}

      {showFile && (
        <span className="file-label">
          {file}
        </span>
      )}

      <span
        className={
          pieceColor === "white"
            ? "white-piece"
            : pieceColor === "black"
              ? "black-piece"
              : ""
        }
      >
        {piece}
      </span>

      {isLegalMove && !piece && (
        <span className="move-indicator" />
      )}

      {isLegalMove && piece && (
        <span className="capture-indicator" />
      )}
    </button>
  );
}

export default ChessSquare;