import { Chess } from "chess.js";

export type Difficulty =
  | "beginner"
  | "intermediate"
  | "expert";

const skillByDifficulty: Record<Difficulty, number> = {
  beginner: 3,
  intermediate: 10,
  expert: 20,
};

export function getSkillLevel(
  difficulty: Difficulty,
): number {
  return skillByDifficulty[difficulty];
}

export function getComputerMove(
  game: Chess,
  difficulty: Difficulty,
  sendCommand: (command: string) => void,
) {
  const skill = getSkillLevel(difficulty);

  sendCommand(`setoption name Skill Level value ${skill}`);
  sendCommand("isready");
  sendCommand(`position fen ${game.fen()}`);
  sendCommand("go depth 12");
}