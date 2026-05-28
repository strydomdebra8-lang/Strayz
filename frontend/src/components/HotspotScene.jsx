import { useMemo } from "react";
import * as Lucide from "lucide-react";
import { LEVEL_HOTSPOTS } from "@/data/hotspots";
import { CHARACTERS } from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";
import { sfx } from "@/lib/sound";

export default function HotspotScene({
  levelId,
  background,
  puzzles,
  solvedIds,
  currentIdx,
  onPick,
  characterId,
}) {
  const hotspots = LEVEL_HOTSPOTS[levelId] || [];
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
  const mapping = useMemo(() => {
    return hotspots.map((h, i) => ({
      ...h,
      puzzleIndex: i < puzzles.length ? i : null,
      puzzleId: i < puzzles.length ? puzzles[i].id : null,
    }));
  }, [hotspots, puzzles]);

  return (
    <div
      className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-slate-800 tactile-shadow-lg"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.25), rgba(15,23,42,0.4)), url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "320px",
        aspectRatio: "16 / 9",
      }}
      data-testid="hotspot-scene"
    >
      {/* Walking character along the bottom of the scene */}
      <div
        className="absolute bottom-3 animate-walk-cross pointer-events-none"
        style={{ width: 60, height: 60 }}
        data-testid="walking-character"
      >
        <div className="w-full h-full rounded-full border-4 border-slate-800 overflow-hidden bg-white tactile-shadow-sm animate-walk-bob">
          <img
            src={resolveCharacterImage(character)}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Shadow */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(0,0,0,0.5), transparent)" }}
        />
      </div>
      {mapping.map((h, idx) => {
        const Icon = Lucide[h.icon] || Lucide.MapPin;
        const isSolved = h.puzzleId && solvedIds.has(h.puzzleId);
        const isCurrent = idx === currentIdx;
        const isLocked = h.puzzleIndex === null;
        return (
          <button
            key={h.id}
            onClick={() => {
              if (isLocked || isSolved) return;
              sfx.click();
              onPick?.(h.puzzleIndex);
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 group flex flex-col items-center gap-1 ${
              isCurrent && !isSolved ? "animate-float-soft" : ""
            }`}
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            disabled={isLocked || isSolved}
            data-testid={`hotspot-${levelId}-${h.id}`}
            aria-label={h.label}
          >
            <span
              className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-slate-800 flex items-center justify-center transition-all ${
                isSolved
                  ? "bg-emerald-300"
                  : isCurrent
                  ? "bg-amber-300 ring-4 ring-amber-200 animate-pulse"
                  : isLocked
                  ? "bg-slate-300 opacity-60"
                  : "bg-white hover:bg-amber-200"
              }`}
            >
              {isSolved ? (
                <Lucide.Check
                  className="w-6 h-6 text-emerald-900"
                  strokeWidth={3}
                />
              ) : (
                <Icon className="w-6 h-6 text-slate-800" strokeWidth={2.5} />
              )}
              {isCurrent && !isSolved && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-500 border-2 border-slate-800 animate-pulse" />
              )}
            </span>
            <span className="font-accent text-[10px] sm:text-xs uppercase px-2 py-0.5 bg-white border-2 border-slate-800 rounded-full tactile-shadow-sm whitespace-nowrap">
              {h.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
