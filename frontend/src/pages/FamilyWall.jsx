import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import { Download, Share2, Home, Coins, Star, Award } from "lucide-react";
import GameNav from "@/components/GameNav";
import TactileButton from "@/components/TactileButton";
import { CHARACTERS } from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";
import { getPlayer } from "@/lib/api";
import { getPlayerId, getPlayerName } from "@/lib/gameStore";
import { ACHIEVEMENTS, getEarned } from "@/lib/achievements";

export default function FamilyWall() {
  const navigate = useNavigate();
  const wallRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [earned, setEarned] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPlayer(getPlayerId()).then(setPlayer).catch(() => {});
    setEarned(getEarned());
  }, []);

  const exportPng = async () => {
    if (!wallRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(wallRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#FEF3C7",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `strayz-family-${Date.now()}.png`;
      a.click();
      toast.success("Family Wall downloaded — share it!");
    } catch {
      toast.error("Could not export image");
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!wallRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(wallRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#FEF3C7",
      });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "strayz-family.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My Strayz Family",
          text: "Check out my Strayz family adventure!",
        });
      } else {
        exportPng();
      }
    } catch {
      exportPng();
    } finally {
      setBusy(false);
    }
  };

  const coins = player?.coins ?? 0;
  const stars = Object.values(player?.level_stars || {}).reduce(
    (a, b) => a + b,
    0
  );
  const levelsDone = (player?.levels_completed || []).length;

  return (
    <div
      className="min-h-screen bg-amber-100"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(167,139,250,0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(56,189,248,0.3), transparent 50%)",
      }}
      data-testid="family-wall-page"
    >
      <GameNav player={player} onOpenShop={() => navigate("/")} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-4">
          <span className="font-accent text-pink-700">SHAREABLE</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 text-shadow-pop">
            Family Wall
          </h1>
          <p className="text-slate-700 font-semibold mt-2">
            One-tap export to share with friends &amp; family.
          </p>
        </div>

        {/* The wall (this DOM is what gets exported) */}
        <div
          ref={wallRef}
          className="tactile-card bg-amber-50 p-5"
          data-testid="family-wall-content"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-accent text-pink-700 text-xs">STRAYZ FAMILY</p>
              <p className="font-display font-bold text-2xl text-slate-900">
                {getPlayerName()}'s Crew
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="tactile-chip text-amber-700">
                <Coins className="w-3 h-3" strokeWidth={3} /> {coins}
              </span>
              <span className="tactile-chip text-amber-700">
                <Star className="w-3 h-3" strokeWidth={3} fill="#FBBF24" /> {stars}
              </span>
              <span className="tactile-chip text-emerald-700">
                {levelsDone}/6 Levels
              </span>
              <span className="tactile-chip text-violet-700">
                <Award className="w-3 h-3" strokeWidth={3} /> {earned.length}/
                {ACHIEVEMENTS.length}
              </span>
            </div>
          </div>

          <div
            className="grid grid-cols-3 gap-3"
            data-testid="family-wall-grid"
          >
            {CHARACTERS.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border-4 border-slate-800 p-2 text-center"
                style={{ backgroundColor: c.color + "30" }}
              >
                <div
                  className="w-full aspect-square rounded-xl border-2 border-slate-800 overflow-hidden mb-1"
                  style={{ backgroundColor: c.color + "40" }}
                >
                  <img
                    src={resolveCharacterImage(c)}
                    alt={c.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="font-display font-bold text-sm text-slate-900">
                  {c.name}
                </p>
                <p className="text-[10px] text-slate-700 leading-tight">
                  {c.specialty}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-3 text-center text-xs text-slate-600 font-bold uppercase">
            Strayz · Educational Adventure Game
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <TactileButton
            color="#4ADE80"
            size="lg"
            icon={Download}
            onClick={exportPng}
            disabled={busy}
            data-testid="export-png-button"
          >
            {busy ? "Working…" : "Download PNG"}
          </TactileButton>
          <TactileButton
            color="#FB923C"
            size="lg"
            icon={Share2}
            onClick={share}
            disabled={busy}
            data-testid="share-wall-button"
          >
            Share
          </TactileButton>
          <TactileButton
            color="#FFFFFF"
            textColor="#1E293B"
            size="lg"
            icon={Home}
            onClick={() => navigate("/")}
            data-testid="wall-back-home"
          >
            Home
          </TactileButton>
        </div>
      </main>
    </div>
  );
}
