import { useEffect, useRef, useState } from "react";
import TactileButton from "@/components/TactileButton";
import { Check, RotateCcw } from "lucide-react";

const COLORS = {
  red: "#F87171",
  blue: "#60A5FA",
  green: "#4ADE80",
  yellow: "#FBBF24",
  do: "#F472B6",
  re: "#FB923C",
  mi: "#FBBF24",
  fa: "#4ADE80",
  sol: "#38BDF8",
  la: "#A78BFA",
  ti: "#F87171",
};

function tokenList(seq) {
  // Build palette: unique tokens in the sequence + ensure at least 4 options
  const set = Array.from(new Set(seq));
  const extras = Object.keys(COLORS).filter((k) => !set.includes(k));
  while (set.length < 4 && extras.length) {
    set.push(extras.shift());
  }
  return set.slice(0, Math.max(4, set.length));
}

export default function PatternPuzzle({ puzzle, onSubmit, disabled }) {
  const sequence = puzzle.sequence || [];
  const [phase, setPhase] = useState("watch"); // watch | input | done
  const [highlight, setHighlight] = useState(null);
  const [picked, setPicked] = useState([]);
  const palette = tokenList(sequence);
  const timersRef = useRef([]);

  // Reset & play sequence when puzzle changes
  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    setPhase("watch");
    setPicked([]);
    setHighlight(null);

    sequence.forEach((tok, idx) => {
      const tOn = setTimeout(() => setHighlight(tok), 600 * (idx + 1));
      const tOff = setTimeout(() => setHighlight(null), 600 * (idx + 1) + 350);
      timersRef.current.push(tOn, tOff);
    });
    const tEnd = setTimeout(() => setPhase("input"), 600 * (sequence.length + 1));
    timersRef.current.push(tEnd);

    return () => timersRef.current.forEach((t) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle.id]);

  const pick = (tok) => {
    if (phase !== "input" || disabled) return;
    const next = [...picked, tok];
    setPicked(next);
    if (next.length === sequence.length) {
      setPhase("done");
      onSubmit(JSON.stringify(next));
    }
  };

  const replay = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    setPicked([]);
    setHighlight(null);
    setPhase("watch");
    sequence.forEach((tok, idx) => {
      const tOn = setTimeout(() => setHighlight(tok), 500 * (idx + 1));
      const tOff = setTimeout(() => setHighlight(null), 500 * (idx + 1) + 300);
      timersRef.current.push(tOn, tOff);
    });
    const tEnd = setTimeout(() => setPhase("input"), 500 * (sequence.length + 1));
    timersRef.current.push(tEnd);
  };

  return (
    <div className="space-y-6" data-testid="pattern-puzzle">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-accent text-lg text-slate-700">
          {phase === "watch"
            ? "WATCH THE SEQUENCE..."
            : phase === "input"
            ? `YOUR TURN (${picked.length}/${sequence.length})`
            : "SUBMITTED"}
        </span>
        <button
          onClick={replay}
          className="tactile-btn bg-white text-slate-800 px-3 py-2 text-sm"
          data-testid="pattern-replay-button"
          disabled={phase === "watch"}
        >
          <RotateCcw className="w-4 h-4 inline mr-1" strokeWidth={3} />
          Replay
        </button>
      </div>

      {/* Big preview tile */}
      <div
        className="w-full h-40 rounded-3xl border-4 border-slate-800 tactile-shadow-lg flex items-center justify-center transition-colors duration-150"
        style={{
          backgroundColor: highlight ? COLORS[highlight] || "#fff" : "#FFFFFF",
        }}
        data-testid="pattern-preview-tile"
      >
        <span className="font-display font-bold text-2xl uppercase text-slate-900">
          {highlight || "—"}
        </span>
      </div>

      {/* Player picks display */}
      <div className="flex flex-wrap gap-2 min-h-[3rem]">
        {picked.map((tok, i) => (
          <span
            key={i}
            className="w-12 h-12 rounded-xl border-2 border-slate-800 tactile-shadow-sm flex items-center justify-center text-xs font-bold uppercase"
            style={{ backgroundColor: COLORS[tok] || "#fff" }}
          >
            {tok}
          </span>
        ))}
      </div>

      {/* Palette */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {palette.map((tok) => (
          <TactileButton
            key={tok}
            color={COLORS[tok] || "#fff"}
            textColor="#1E293B"
            onClick={() => pick(tok)}
            disabled={phase !== "input" || disabled}
            data-testid={`pattern-tile-${tok}`}
            className="h-16"
          >
            {tok}
          </TactileButton>
        ))}
      </div>

      {phase === "done" && (
        <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
          <Check className="w-5 h-5" strokeWidth={3} />
          Sequence submitted!
        </div>
      )}
    </div>
  );
}
