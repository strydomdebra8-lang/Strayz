import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STORY_INTRO, CHARACTERS, BACKGROUNDS } from "@/data/storyData";
import TactileButton from "@/components/TactileButton";
import { ArrowRight, SkipForward } from "lucide-react";

function speakerColor(speaker) {
  if (speaker === "Narrator") return "#1E293B";
  const c = CHARACTERS.find((c) => c.name === speaker);
  return c?.color || "#38BDF8";
}
function speakerImg(speaker) {
  const c = CHARACTERS.find((c) => c.name === speaker);
  return c?.image;
}

export default function StoryIntro() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const cur = STORY_INTRO[idx];
  const next = () => {
    if (idx === STORY_INTRO.length - 1) {
      navigate("/map");
    } else {
      setIdx(idx + 1);
    }
  };

  return (
    <div
      className="min-h-screen flex items-end sm:items-center justify-center p-4 sm:p-8"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.7)), url(${BACKGROUNDS.main})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      data-testid="story-intro-page"
    >
      <div
        className="max-w-3xl w-full tactile-card bg-white p-6 sm:p-8 animate-pop-in"
        key={idx}
      >
        <div className="flex flex-col sm:flex-row gap-5">
          {speakerImg(cur.speaker) ? (
            <img
              src={speakerImg(cur.speaker)}
              alt={cur.speaker}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-slate-800 object-cover flex-shrink-0"
              data-testid="story-speaker-image"
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-slate-800 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: speakerColor(cur.speaker) }}
            >
              <span className="font-accent text-white text-3xl">N</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span
              className="inline-block font-accent text-sm px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: speakerColor(cur.speaker) }}
              data-testid="story-speaker-name"
            >
              {cur.speaker}
            </span>
            <p
              className="mt-3 text-lg sm:text-xl font-bold text-slate-900 leading-relaxed"
              data-testid="story-text"
            >
              {cur.text}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500 font-bold">
            {idx + 1} / {STORY_INTRO.length}
          </span>
          <div className="flex gap-2">
            <TactileButton
              color="#FFFFFF"
              textColor="#1E293B"
              size="sm"
              icon={SkipForward}
              onClick={() => navigate("/map")}
              data-testid="story-skip-button"
            >
              Skip
            </TactileButton>
            <TactileButton
              color="#38BDF8"
              size="md"
              icon={ArrowRight}
              onClick={next}
              data-testid="story-next-button"
            >
              {idx === STORY_INTRO.length - 1 ? "Begin" : "Next"}
            </TactileButton>
          </div>
        </div>
      </div>
    </div>
  );
}
