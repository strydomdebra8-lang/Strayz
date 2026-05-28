import { useEffect, useMemo, useState } from "react";
import { Sparkles, Star, ChevronDown, MessageCircle } from "lucide-react";
import {
  CHARACTERS,
  CHARACTER_SPECIALTY_LEVEL,
  getCharacterLine,
} from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";

const MOOD_RING = {
  idle: "ring-sky-300",
  happy: "ring-emerald-400",
  thinking: "ring-amber-400",
  sad: "ring-rose-400",
};

const MOOD_LABEL = {
  idle: "Ready",
  happy: "Yay!",
  thinking: "Hmm…",
  sad: "Oops",
};

const MOOD_EMOJI = {
  idle: Sparkles,
  happy: Star,
  thinking: MessageCircle,
  sad: MessageCircle,
};

export default function CharacterCompanion({
  characterId,
  mood = "idle",
  speech,
  levelId,
  onSwitch,
  onTap,
}) {
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
  const [open, setOpen] = useState(false);
  const [tapLine, setTapLine] = useState("");

  // When mood changes & no explicit speech given, auto-pick a line
  const autoLine = useMemo(() => {
    if (speech) return speech;
    if (mood === "happy") return getCharacterLine(characterId, "onCorrect");
    if (mood === "sad") return getCharacterLine(characterId, "onWrong");
    return "";
  }, [characterId, mood, speech]);

  useEffect(() => {
    if (autoLine) {
      setTapLine(autoLine);
      const t = setTimeout(() => setTapLine(""), 4200);
      return () => clearTimeout(t);
    }
  }, [autoLine, mood]);

  const isSpecialty = CHARACTER_SPECIALTY_LEVEL[characterId] === Number(levelId);
  const Icon = MOOD_EMOJI[mood] || Sparkles;

  const handleTap = () => {
    const line =
      mood === "idle"
        ? getCharacterLine(characterId, "onIdle")
        : autoLine || getCharacterLine(characterId, "onIdle");
    setTapLine(line);
    onTap?.(line);
    setTimeout(() => setTapLine(""), 4500);
  };

  return (
    <div
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2"
      data-testid="character-companion"
    >
      {/* Speech bubble */}
      {tapLine && (
        <div
          className="max-w-[260px] sm:max-w-xs animate-pop-in tactile-card bg-white px-4 py-3 text-sm font-semibold text-slate-800 relative"
          data-testid="companion-speech"
        >
          {tapLine}
          <span
            className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r-4 border-b-4 border-slate-800 rotate-45"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Specialty badge */}
      {isSpecialty && (
        <span
          className="tactile-chip text-amber-700 bg-amber-100 text-xs"
          data-testid="specialty-badge"
        >
          <Star className="w-3 h-3" strokeWidth={3} fill="#FBBF24" />
          Specialty +bonus
        </span>
      )}

      <div className="flex items-center gap-2">
        {/* Switch character dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="tactile-btn bg-white text-slate-800 px-2 py-2 text-xs"
            data-testid="companion-switch-button"
            aria-label="Switch character"
          >
            <ChevronDown className="w-4 h-4" strokeWidth={3} />
          </button>
          {open && (
            <div
              className="absolute bottom-14 right-0 tactile-card bg-white p-2 w-48"
              data-testid="companion-switch-menu"
            >
              {CHARACTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSwitch?.(c.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl text-left font-semibold text-sm hover:bg-amber-100 ${
                    c.id === characterId ? "bg-amber-50" : ""
                  }`}
                  data-testid={`switch-to-${c.id}`}
                >
                  <span
                    className="w-7 h-7 rounded-lg border-2 border-slate-800 overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: c.color + "40" }}
                  >
                    <img
                      src={resolveCharacterImage(c)}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="flex-1 min-w-0 truncate">{c.name}</span>
                  {CHARACTER_SPECIALTY_LEVEL[c.id] === Number(levelId) && (
                    <Star
                      className="w-3 h-3 text-amber-500"
                      strokeWidth={3}
                      fill="#FBBF24"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          onClick={handleTap}
          className={`relative w-20 h-20 rounded-full border-4 border-slate-800 ring-4 ring-offset-2 ring-offset-amber-100 ${MOOD_RING[mood]} tactile-shadow overflow-hidden bg-white transition-transform hover:-translate-y-1 active:translate-y-0`}
          data-testid="companion-avatar"
          aria-label={`Talk to ${character.name}`}
          style={{ backgroundColor: character.color + "30" }}
        >
          <img
            src={resolveCharacterImage(character)}
            alt={character.name}
            className="w-full h-full object-cover"
          />
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border-2 border-slate-800 bg-white text-slate-800"
            data-testid="companion-mood"
          >
            <Icon className="w-3 h-3 inline mr-0.5" strokeWidth={3} />
            {MOOD_LABEL[mood]}
          </span>
        </button>
      </div>
      <p className="text-xs font-bold text-slate-700 bg-white/80 px-2 py-0.5 rounded-full border-2 border-slate-800">
        {character.name}
      </p>
    </div>
  );
}
