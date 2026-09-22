import { useEffect, useRef, useState } from "react";

export type StockfishDifficulty =
  | "beginner"
  | "intermediate"
  | "expert";

const skillByDifficulty: Record<StockfishDifficulty, number> = {
  beginner: 3,
  intermediate: 10,
  expert: 20,
};

export function useStockfish() {
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);

  const pendingMoveRef = useRef<{
    resolve: (move: string | null) => void;
  } | null>(null);

  useEffect(() => {
    const worker = new Worker(
      "/stockfish/stockfish-19-single.js",
    );

    workerRef.current = worker;

    worker.onmessage = (event) => {
      const message = event.data;

      if (typeof message !== "string") {
        return;
      }

      console.log("Stockfish:", message);

      if (message === "uciok") {
        setReady(true);
      }

      if (message.startsWith("bestmove")) {
        const move = message.split(" ")[1] ?? null;

        pendingMoveRef.current?.resolve(move);
        pendingMoveRef.current = null;
      }
    };

    worker.onerror = (error) => {
      console.error("Stockfish worker error:", error);
    };

    worker.postMessage("uci");

    return () => {
      worker.postMessage("quit");
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const getBestMove = (
    fen: string,
    difficulty: StockfishDifficulty,
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      const worker = workerRef.current;

      if (!worker || !ready) {
        resolve(null);
        return;
      }

      pendingMoveRef.current = {
        resolve,
      };

      const skill = skillByDifficulty[difficulty];

      worker.postMessage(
        `setoption name Skill Level value ${skill}`,
      );

      worker.postMessage("isready");

      worker.postMessage(`position fen ${fen}`);

      worker.postMessage("go depth 12");
    });
  };

  return {
    ready,
    getBestMove,
  };
}