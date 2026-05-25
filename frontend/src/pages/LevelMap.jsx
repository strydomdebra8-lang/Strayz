import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TreePine,
  Music,
  BookOpen,
  FlaskConical,
  Crown,
  Trophy,
  Lock,
  Star,
  Play,
} from "lucide-react";
import GameNav from "@/components/GameNav";
import ShopDrawer from "@/components/ShopDrawer";
import TactileButton from "@/components/TactileButton";
import { BACKGROUNDS } from "@/data/storyData";
import { getLevels, getPlayer } from "@/lib/api";
import { getPlayerId } from "@/lib/gameStore";
import { playMusic } from "@/lib/sound";

const ICON_MAP = { TreePine, Music, BookOpen, FlaskConical, Crown, Trophy };

export default function LevelMap() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [player, setPlayer] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    getLevels().then((d) => setLevels(d.levels)).catch(() => {});
    getPlayer(getPlayerId()).then(setPlayer).catch(() => {});
    playMusic("menu");
  }, []);

  const completed = new Set(player?.levels_completed || []);
  const stars = player?.level_stars || {};

  const isUnlocked = (id) => {
    if (id === 1) return true;
    return completed.has(id - 1);
  };

  return (
    <div
      className="min-h-screen bg-amber-100"
      style={{
        backgroundImage: `linear-gradient(rgba(254,243,199,0.7), rgba(254,243,199,0.95)), url(${BACKGROUNDS.main})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      data-testid="level-map-page"
    >
      <GameNav player={player} onOpenShop={() => setShopOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <span className="font-accent text-sky-700">CHOOSE YOUR QUEST</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 text-shadow-pop">
            World Map
          </h1>
          <p className="mt-2 text-slate-700 font-semibold">
            Recover one stolen artifact at every stop. Complete a level to unlock the next.
          </p>
        </div>

        <div
          className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="levels-grid"
        >
          {levels.map((lvl) => {
            const Icon = ICON_MAP[lvl.icon] || Crown;
            const unlocked = isUnlocked(lvl.id);
            const lvlStars = stars[String(lvl.id)] || 0;
            const wasCompleted = completed.has(lvl.id);

            return (
              <div
                key={lvl.id}
                className="tactile-card p-5 relative"
                style={{ backgroundColor: lvl.color + "22" }}
                data-testid={`level-card-${lvl.id}`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-2xl border-2 border-slate-800 flex items-center justify-center"
                    style={{ backgroundColor: lvl.color }}
                  >
                    <Icon className="w-6 h-6 text-white" strokeWidth={3} />
                  </div>
                  <span className="font-accent text-sm bg-white border-2 border-slate-800 rounded-full px-3 py-1">
                    LEVEL {lvl.id}
                  </span>
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-900 mt-3">
                  {lvl.name}
                </h3>
                <p className="text-xs uppercase tracking-widest font-bold text-slate-600">
                  {lvl.subject}
                </p>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed min-h-[3rem]">
                  {lvl.description}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-1" data-testid={`level-stars-${lvl.id}`}>
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className="w-5 h-5"
                        strokeWidth={3}
                        fill={s <= lvlStars ? "#FBBF24" : "transparent"}
                        color={s <= lvlStars ? "#FBBF24" : "#94A3B8"}
                      />
                    ))}
                  </div>
                  {unlocked ? (
                    <TactileButton
                      color={lvl.color}
                      size="sm"
                      icon={Play}
                      onClick={() => navigate(`/play/${lvl.id}`)}
                      data-testid={`play-level-${lvl.id}`}
                    >
                      {wasCompleted ? "Replay" : "Play"}
                    </TactileButton>
                  ) : (
                    <span
                      className="tactile-chip text-slate-500 bg-slate-100"
                      data-testid={`locked-${lvl.id}`}
                    >
                      <Lock className="w-4 h-4" strokeWidth={3} />
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={setPlayer}
      />
    </div>
  );
}
