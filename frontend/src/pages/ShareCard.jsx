import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import {
  Share2,
  Download,
  Copy,
  Sparkles,
  Coins,
  Gem,
  Star,
  Shield,
  Sprout,
  Trophy,
} from "lucide-react";
import GameNav from "@/components/GameNav";
import TactileButton from "@/components/TactileButton";
import { CHARACTERS } from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";
import { getShareCard, getPlayer } from "@/lib/api";
import { getPlayerId } from "@/lib/gameStore";
import { sfx, playMusic } from "@/lib/sound";

export default function ShareCard() {
  const navigate = useNavigate();
  const [card, setCard] = useState(null);
  const [player, setPlayer] = useState(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef(null);
  const playerId = getPlayerId();

  useEffect(() => {
    getShareCard(playerId)
      .then(setCard)
      .catch(() => toast.error("Could not load share card"));
    getPlayer(playerId).then(setPlayer).catch(() => {});
    playMusic("menu");
  }, [playerId]);

  if (!card) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <p className="font-display text-2xl text-slate-700 animate-pulse">
          Loading share card…
        </p>
      </div>
    );
  }

  const character =
    CHARACTERS.find((c) => c.id === card.character_id) || CHARACTERS[0];
  const portraitUrl = resolveCharacterImage(character);

  const tagline = (() => {
    if (card.levels_completed >= 6) return "World Liberator";
    if (card.raids_won >= 5) return "Castle Defender";
    if (card.homestead_level >= 3) return "Master Farmer";
    if (card.levels_completed >= 3) return "Explorer";
    if (card.coins >= 500) return "Coin Collector";
    return "Rising Stray";
  })();

  const shareText = `I'm playing Strayz as ${card.name} the ${character.name} ${character.role}!
🪙 ${card.coins} coins  💎 ${card.gems} gems  ⭐ ${card.stars} stars
🏰 Wall Lv${card.wall_level}  🌱 Homestead Lv${card.homestead_level}  ⚔️ ${card.raids_won} raids won
Play at ${window.location.origin}`;

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `strayz-${card.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      sfx.coin();
      toast.success("Share card downloaded!");
    } catch (e) {
      toast.error("Download failed — please try again");
    } finally {
      setBusy(false);
    }
  };

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      sfx.click();
      toast.success("Share text copied to clipboard");
    } catch {
      toast.error("Clipboard not available");
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) {
      copyShareText();
      return;
    }
    try {
      await navigator.share({
        title: "Strayz - Educational Adventure",
        text: shareText,
      });
      sfx.levelUp();
    } catch (err) {
      // User cancelled the share sheet — expected, not an error.
      if (process.env.NODE_ENV !== "production") console.warn("ShareCard: navigator.share cancelled or failed", err);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 0%, rgba(251,191,36,0.4), transparent 55%), radial-gradient(circle at 85% 100%, rgba(244,114,182,0.4), transparent 55%), linear-gradient(180deg, #FEF3C7 0%, #FED7AA 100%)",
      }}
      data-testid="share-card-page"
    >
      <GameNav player={player || { coins: card.coins, gems: card.gems }} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <section className="text-center">
          <span className="font-accent text-pink-700 inline-flex items-center gap-2">
            <Share2 className="w-4 h-4" strokeWidth={3} />
            SHARE YOUR JOURNEY
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 text-shadow-pop">
            Your Strayz Card
          </h1>
          <p className="text-slate-700 font-semibold mt-2">
            Download a snapshot of your adventure and share it with friends.
          </p>
        </section>

        {/* The shareable card */}
        <div className="mt-8 flex justify-center">
          <div
            ref={cardRef}
            className="relative w-[360px] sm:w-[480px] rounded-[28px] overflow-hidden border-[6px] border-slate-900 bg-gradient-to-br from-amber-200 via-orange-300 to-pink-300"
            style={{
              boxShadow: "0 12px 0 0 #1E293B",
            }}
            data-testid="share-card-content"
          >
            {/* Confetti dots */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 10% 20%, rgba(255,255,255,0.5) 2px, transparent 3px), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.45) 3px, transparent 4px), radial-gradient(circle at 25% 85%, rgba(255,255,255,0.4) 2px, transparent 3px), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.5) 3px, transparent 4px)",
                backgroundSize: "200px 200px",
              }}
            />

            {/* Header */}
            <div className="relative px-6 pt-6 pb-3 text-center">
              <p className="font-accent text-slate-700 text-sm tracking-widest">
                EDUCATIONAL ADVENTURE
              </p>
              <h2 className="font-display font-bold text-5xl text-slate-900 leading-none">
                STRAYZ
              </h2>
            </div>

            {/* Portrait + Name */}
            <div className="relative px-6 pb-3 flex items-center gap-4">
              <div
                className="w-24 h-24 rounded-3xl border-4 border-slate-900 overflow-hidden flex-shrink-0 bg-white"
                style={{ backgroundColor: (character.color || "#FBBF24") + "40" }}
              >
                <img
                  src={portraitUrl}
                  alt={character.name}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-display font-bold text-2xl text-slate-900 truncate"
                  data-testid="share-name"
                >
                  {card.name}
                </p>
                <p className="text-sm font-semibold text-slate-800 truncate">
                  as <strong>{character.name}</strong>
                </p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-display font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 inline mr-1" strokeWidth={3} />
                  {tagline}
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="relative mx-4 mb-4 bg-white/95 border-4 border-slate-900 rounded-2xl p-4 grid grid-cols-3 gap-3">
              <StatTile
                icon={Coins}
                color="#D97706"
                label="Coins"
                value={card.coins}
              />
              <StatTile
                icon={Gem}
                color="#7C3AED"
                label="Gems"
                value={card.gems}
              />
              <StatTile
                icon={Star}
                color="#EAB308"
                label="Stars"
                value={card.stars}
              />
              <StatTile
                icon={Trophy}
                color="#F59E0B"
                label="Levels"
                value={`${card.levels_completed}/6`}
              />
              <StatTile
                icon={Sprout}
                color="#16A34A"
                label="Farm Lv"
                value={card.homestead_level}
              />
              <StatTile
                icon={Shield}
                color="#DC2626"
                label="Raids"
                value={card.raids_won}
              />
            </div>

            {/* Footer */}
            <div className="relative px-6 pb-5 text-center">
              <p className="font-display font-bold text-slate-900 text-sm">
                Play Strayz today!
              </p>
              <p className="text-[10px] font-mono text-slate-700 mt-1 truncate">
                {typeof window !== "undefined" ? window.location.origin : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <TactileButton
            color="#4ADE80"
            size="lg"
            icon={Download}
            onClick={downloadCard}
            disabled={busy}
            data-testid="download-card-button"
          >
            {busy ? "Rendering…" : "Download PNG"}
          </TactileButton>
          <TactileButton
            color="#A78BFA"
            size="lg"
            icon={Copy}
            onClick={copyShareText}
            data-testid="copy-share-text-button"
          >
            Copy Tweet
          </TactileButton>
          <TactileButton
            color="#38BDF8"
            size="lg"
            icon={Share2}
            onClick={nativeShare}
            data-testid="native-share-button"
          >
            Share
          </TactileButton>
        </div>

        <div className="text-center mt-8">
          <TactileButton
            color="#FBBF24"
            textColor="#1E293B"
            size="md"
            onClick={() => navigate("/")}
            data-testid="back-to-menu"
          >
            Back to Menu
          </TactileButton>
        </div>
      </main>
    </div>
  );
}

function StatTile({ icon: Icon, color, label, value }) {
  return (
    <div
      className="rounded-xl border-2 border-slate-800 px-2 py-2 text-center bg-amber-50"
      data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Icon
        className="w-5 h-5 mx-auto"
        strokeWidth={3}
        style={{ color }}
      />
      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mt-1">
        {label}
      </p>
      <p className="font-display font-bold text-lg text-slate-900 leading-none">
        {value}
      </p>
    </div>
  );
}
