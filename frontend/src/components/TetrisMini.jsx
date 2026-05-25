import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, RotateCw, Play, Pause } from "lucide-react";
import TactileButton from "@/components/TactileButton";
import { sfx } from "@/lib/sound";

// Standard Tetris-style mini-game (simplified)
const ROWS = 18;
const COLS = 10;
const EMPTY = 0;

const SHAPES = {
  I: { cells: [[1, 1, 1, 1]], color: "#38BDF8" },
  O: { cells: [[1, 1], [1, 1]], color: "#FBBF24" },
  T: { cells: [[0, 1, 0], [1, 1, 1]], color: "#A78BFA" },
  L: { cells: [[1, 0], [1, 0], [1, 1]], color: "#FB923C" },
  J: { cells: [[0, 1], [0, 1], [1, 1]], color: "#60A5FA" },
  S: { cells: [[0, 1, 1], [1, 1, 0]], color: "#4ADE80" },
  Z: { cells: [[1, 1, 0], [0, 1, 1]], color: "#F87171" },
};
const KEYS = Object.keys(SHAPES);

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function randomPiece() {
  const k = KEYS[Math.floor(Math.random() * KEYS.length)];
  const s = SHAPES[k];
  return {
    shape: s.cells.map((r) => r.slice()),
    color: s.color,
    x: Math.floor((COLS - s.cells[0].length) / 2),
    y: 0,
  };
}

function rotate(shape) {
  const h = shape.length;
  const w = shape[0].length;
  const out = Array.from({ length: w }, () => Array(h).fill(0));
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      out[c][h - 1 - r] = shape[r][c];
    }
  }
  return out;
}

function canPlace(board, piece, dx = 0, dy = 0, newShape) {
  const shape = newShape || piece.shape;
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const ny = piece.y + r + dy;
      const nx = piece.x + c + dx;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return false;
      if (ny >= 0 && board[ny][nx] !== EMPTY) return false;
    }
  }
  return true;
}

function mergeBoard(board, piece) {
  const next = board.map((r) => r.slice());
  piece.shape.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v) {
        const ny = piece.y + r;
        const nx = piece.x + c;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
          next[ny][nx] = piece.color;
        }
      }
    });
  });
  return next;
}

function clearLines(board) {
  let cleared = 0;
  const remaining = board.filter((row) => {
    if (row.every((c) => c !== EMPTY)) {
      cleared++;
      return false;
    }
    return true;
  });
  while (remaining.length < ROWS) remaining.unshift(Array(COLS).fill(EMPTY));
  return { board: remaining, cleared };
}

export default function TetrisMini({ onClose }) {
  const [board, setBoard] = useState(createBoard);
  const [piece, setPiece] = useState(randomPiece);
  const [next, setNext] = useState(randomPiece);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [over, setOver] = useState(false);

  const speedMs = Math.max(120, 700 - (level - 1) * 60);

  const move = useCallback(
    (dx, dy) => {
      if (over || paused) return;
      setPiece((cur) => {
        if (canPlace(board, cur, dx, dy)) {
          if (dx !== 0) sfx.pop();
          return { ...cur, x: cur.x + dx, y: cur.y + dy };
        }
        // If moving down and collides -> lock
        if (dy > 0) {
          sfx.drop();
          const merged = mergeBoard(board, cur);
          const { board: cleared, cleared: linesCleared } = clearLines(merged);
          if (linesCleared > 0) sfx.lineClear();
          setBoard(cleared);
          const gained = [0, 40, 100, 300, 1200][linesCleared] || 0;
          setScore((s) => s + gained + 5);
          setLines((l) => {
            const nl = l + linesCleared;
            setLevel(1 + Math.floor(nl / 5));
            return nl;
          });
          const np = next;
          setNext(randomPiece());
          if (!canPlace(cleared, np)) {
            setOver(true);
            sfx.wrong();
            return cur;
          }
          return np;
        }
        return cur;
      });
    },
    [board, paused, over, next]
  );

  const rotateCurrent = useCallback(() => {
    if (over || paused) return;
    setPiece((cur) => {
      const rotated = rotate(cur.shape);
      if (canPlace(board, cur, 0, 0, rotated)) {
        sfx.rotate();
        return { ...cur, shape: rotated };
      }
      return cur;
    });
  }, [board, paused, over]);

  // Falling tick
  useEffect(() => {
    if (over || paused) return;
    const id = setInterval(() => move(0, 1), speedMs);
    return () => clearInterval(id);
  }, [move, speedMs, paused, over]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") move(-1, 0);
      else if (e.key === "ArrowRight") move(1, 0);
      else if (e.key === "ArrowDown") move(0, 1);
      else if (e.key === "ArrowUp" || e.key === " ") rotateCurrent();
      else if (e.key.toLowerCase() === "p") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, rotateCurrent]);

  const restart = () => {
    setBoard(createBoard());
    setPiece(randomPiece());
    setNext(randomPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setOver(false);
    setPaused(false);
  };

  // Build the display board with the falling piece overlay
  const display = board.map((r) => r.slice());
  piece.shape.forEach((row, r) => {
    row.forEach((v, c) => {
      if (v) {
        const ny = piece.y + r;
        const nx = piece.x + c;
        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
          display[ny][nx] = piece.color;
        }
      }
    });
  });

  return (
    <div
      className="flex flex-col lg:flex-row items-center gap-6 justify-center"
      data-testid="tetris-mini"
    >
      {/* Board */}
      <div
        className="tactile-card bg-slate-900 p-2 sm:p-3"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          width: "min(90vw, 320px)",
          aspectRatio: `${COLS} / ${ROWS}`,
          gap: "2px",
        }}
        data-testid="tetris-board"
      >
        {display.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="rounded-sm"
              style={{
                backgroundColor: cell || "#1E293B",
                border: cell ? "1px solid rgba(0,0,0,0.4)" : "1px solid #0F172A",
              }}
            />
          ))
        )}
      </div>

      {/* Side panel */}
      <div className="space-y-3 w-full lg:w-56" data-testid="tetris-panel">
        <div className="tactile-card p-3 text-center">
          <p className="font-accent text-xs text-slate-500">SCORE</p>
          <p className="font-display font-bold text-2xl text-slate-900" data-testid="tetris-score">
            {score}
          </p>
          <p className="text-xs font-bold mt-2 text-slate-600">
            Lines: <span data-testid="tetris-lines">{lines}</span> · Level{" "}
            <span data-testid="tetris-level">{level}</span>
          </p>
        </div>

        <div className="tactile-card p-3">
          <p className="font-accent text-xs text-slate-500 mb-2">NEXT</p>
          <div
            className="grid bg-slate-100 rounded-xl p-2"
            style={{
              gridTemplateColumns: `repeat(${next.shape[0].length}, 1fr)`,
              gap: "2px",
            }}
          >
            {next.shape.flatMap((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`n-${r}-${c}`}
                  className="aspect-square rounded-sm border border-slate-300"
                  style={{ backgroundColor: cell ? next.color : "transparent" }}
                />
              ))
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-3 gap-2">
          <TactileButton
            color="#FFFFFF"
            textColor="#1E293B"
            size="sm"
            onClick={() => move(-1, 0)}
            data-testid="tetris-left"
            aria-label="Left"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          </TactileButton>
          <TactileButton
            color="#FFFFFF"
            textColor="#1E293B"
            size="sm"
            onClick={rotateCurrent}
            data-testid="tetris-rotate"
            aria-label="Rotate"
          >
            <RotateCw className="w-4 h-4" strokeWidth={3} />
          </TactileButton>
          <TactileButton
            color="#FFFFFF"
            textColor="#1E293B"
            size="sm"
            onClick={() => move(1, 0)}
            data-testid="tetris-right"
            aria-label="Right"
          >
            <ArrowRight className="w-4 h-4" strokeWidth={3} />
          </TactileButton>
          <TactileButton
            color="#FBBF24"
            textColor="#1E293B"
            size="sm"
            onClick={() => setPaused((p) => !p)}
            data-testid="tetris-pause"
            className="col-span-2"
          >
            {paused ? <Play className="w-4 h-4" strokeWidth={3} /> : <Pause className="w-4 h-4" strokeWidth={3} />}
          </TactileButton>
          <TactileButton
            color="#38BDF8"
            size="sm"
            onClick={() => move(0, 1)}
            data-testid="tetris-down"
            aria-label="Drop"
          >
            <ArrowDown className="w-4 h-4" strokeWidth={3} />
          </TactileButton>
        </div>

        {over && (
          <div
            className="tactile-card p-3 text-center bg-rose-100 border-rose-700"
            data-testid="tetris-gameover"
          >
            <p className="font-display font-bold text-lg text-rose-900">
              Game Over!
            </p>
            <p className="text-sm text-slate-700">Final: {score}</p>
            <div className="mt-2 flex gap-2 justify-center">
              <TactileButton color="#4ADE80" size="sm" onClick={restart} data-testid="tetris-restart">
                Replay
              </TactileButton>
              {onClose && (
                <TactileButton
                  color="#FFFFFF"
                  textColor="#1E293B"
                  size="sm"
                  onClick={onClose}
                  data-testid="tetris-close"
                >
                  Done
                </TactileButton>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-500 font-bold text-center leading-relaxed">
          Keys: ← → move · ↓ drop · ↑/Space rotate · P pause
        </p>
      </div>
    </div>
  );
}
