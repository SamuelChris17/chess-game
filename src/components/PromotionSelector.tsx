interface PromotionSelectorProps {
  color: "white" | "black";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
}

function PromotionSelector({
  color,
  onSelect,
}: PromotionSelectorProps) {
  const pieces =
    color === "white"
      ? {
          q: "♕",
          r: "♖",
          b: "♗",
          n: "♘",
        }
      : {
          q: "♛",
          r: "♜",
          b: "♝",
          n: "♞",
        };

  return (
    <div className="promotion-selector">
      <h3>Choose promotion</h3>

      <div className="promotion-options">
        {Object.entries(pieces).map(([piece, symbol]) => (
          <button
            key={piece}
            type="button"
            onClick={() =>
              onSelect(piece as "q" | "r" | "b" | "n")
            }
          >
            {symbol}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PromotionSelector;