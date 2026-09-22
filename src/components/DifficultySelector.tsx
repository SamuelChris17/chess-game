import type { Difficulty } from "../chess/ai";

interface DifficultySelectorProps {
  difficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

function DifficultySelector({
  difficulty,
  onChange,
}: DifficultySelectorProps) {
  return (
    <div className="difficulty-selector">
      <label htmlFor="difficulty">Difficulty</label>

      <select
        id="difficulty"
        value={difficulty}
        onChange={(event) =>
          onChange(event.target.value as Difficulty)
        }
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="expert">Expert</option>
      </select>
    </div>
  );
}

export default DifficultySelector;