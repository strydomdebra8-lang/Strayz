import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getSoundEnabled, setSoundEnabled } from "@/lib/gameStore";
import { refreshMusicForSetting, playMusic, sfx } from "@/lib/sound";

export default function SoundToggle({ trackKey = "menu" }) {
  const [on, setOn] = useState(getSoundEnabled());

  useEffect(() => {
    if (on) playMusic(trackKey);
    else refreshMusicForSetting();
  }, [on, trackKey]);

  const toggle = () => {
    const next = !on;
    setSoundEnabled(next);
    setOn(next);
    if (next) {
      sfx.click();
      playMusic(trackKey);
    } else {
      refreshMusicForSetting();
    }
  };

  return (
    <button
      onClick={toggle}
      className="tactile-btn bg-white text-slate-800 px-3 py-2 text-sm"
      data-testid="sound-toggle"
      aria-label={on ? "Mute sound" : "Unmute sound"}
    >
      {on ? (
        <Volume2 className="w-5 h-5" strokeWidth={3} />
      ) : (
        <VolumeX className="w-5 h-5 text-slate-400" strokeWidth={3} />
      )}
    </button>
  );
}
