import { useEffect, useState } from "react";
import TactileButton from "@/components/TactileButton";

export default function TriviaPuzzle({ puzzle, onSubmit, disabled, locked }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setSelected(null);
  }, [puzzle.id]);

  const pick = (opt) => {
    if (disabled || locked) return;
    setSelected(opt);
    onSubmit(opt);
  };

  const palette = ["#38BDF8", "#FB923C", "#4ADE80", "#A78BFA", "#F472B6"];

  return (
    <div className="space-y-4" data-testid="trivia-puzzle">
      <div className="grid sm:grid-cols-2 gap-3">
        {(puzzle.options || []).map((opt, idx) => {
          const isPicked = selected === opt;
          return (
            <TactileButton
              key={opt}
              color={isPicked ? "#1E293B" : palette[idx % palette.length]}
              textColor="#FFFFFF"
              onClick={() => pick(opt)}
              disabled={disabled || locked}
              data-testid={`trivia-option-${idx}`}
              className="min-h-[3.5rem] whitespace-normal text-left justify-start"
            >
              <span className="font-accent mr-2 opacity-80">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="normal-case font-bold">{opt}</span>
            </TactileButton>
          );
        })}
      </div>
    </div>
  );
}
