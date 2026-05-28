import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Coins,
  Star,
  Award,
  Flame,
  Map as MapIcon,
  CalendarCheck,
  Trophy,
  Home,
  Edit3,
} from "lucide-react";
import GameNav from "@/components/GameNav";
import TactileButton from "@/components/TactileButton";
import PortraitEditor from "@/components/PortraitEditor";
import AdSlot from "@/components/AdSlot";
import { CHARACTERS } from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";
import { ACHIEVEMENTS, getEarned } from "@/lib/achievements";
import { getPlayer } from "@/lib/api";
import client from "@/lib/api";
import {
  getPlayerId,
  getPlayerName,
  getCharacter,
  getDifficulty,
} from "@/lib/gameStore";

export default function Profile() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [streak, setStreak] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const earned = getEarned();
  const characterId = getCharacter();
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

  useEffect(() => {
    getPlayer(getPlayerId()).then(setPlayer).catch(() => {});
    client
      .get(`/login-streak/${getPlayerId()}`)
      .then((r) => setStreak(r.data))
      .catch(() => {});
  }, [refreshKey]);

  const coins = player?.coins ?? 0;
  const gems = player?.gems ?? 0;
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
          "radial-gradient(circle at 20% 20%, rgba(56,189,248,0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(244,114,182,0.3), transparent 50%)",
      }}
      data-testid="profile-page"
    >
      <GameNav player={player} onOpenShop={() => navigate("/")} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        {/* Header */}
        <div
          className="tactile-card bg-white p-5 flex items-center gap-4"
          data-testid="profile-header"
        >
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-slate-800 overflow-hidden flex-shrink-0 relative"
            style={{ backgroundColor: character.color + "30" }}
          >
            <img
              src={resolveCharacterImage(character)}
              alt={character.name}
              className="w-full h-full object-cover"
              key={refreshKey}
            />
            <button
              onClick={() => setEditingId(character.id)}
              className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-white border-2 border-slate-800 flex items-center justify-center hover:bg-amber-100"
              data-testid="profile-edit-portrait"
              aria-label="Edit portrait"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-800" strokeWidth={3} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-accent text-sky-700 text-xs">PLAYER PROFILE</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              {getPlayerName()}
            </h1>
            <p className="text-sm text-slate-700 font-semibold">
              Playing as <strong>{character.name}</strong> · {getDifficulty().toUpperCase()}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          data-testid="profile-stats"
        >
          {[
            { label: "Coins", value: coins, icon: Coins, color: "#FBBF24" },
            { label: "Gems", value: gems, icon: Star, color: "#A78BFA" },
            { label: "Stars", value: stars, icon: Star, color: "#FB923C" },
            { label: "Levels", value: `${levelsDone}/6`, icon: MapIcon, color: "#38BDF8" },
            {
              label: "Streak",
              value: `${streak?.streak ?? 0} day${(streak?.streak ?? 0) === 1 ? "" : "s"}`,
              icon: Flame,
              color: "#F472B6",
            },
            {
              label: "Achievements",
              value: `${earned.length}/${ACHIEVEMENTS.length}`,
              icon: Award,
              color: "#4ADE80",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className="tactile-card bg-white p-4 text-center"
                data-testid={`stat-${s.label.toLowerCase()}`}
              >
                <div
                  className="w-10 h-10 mx-auto rounded-2xl border-2 border-slate-800 flex items-center justify-center"
                  style={{ backgroundColor: s.color }}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <p className="font-display font-bold text-2xl text-slate-900 mt-2">
                  {s.value}
                </p>
                <p className="text-xs font-bold uppercase text-slate-500">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>

        <AdSlot id="profile" />

        {/* Quick actions */}
        <div className="tactile-card bg-white p-4 flex flex-wrap gap-2 justify-center">
          <TactileButton
            color="#FB923C"
            size="sm"
            icon={Trophy}
            onClick={() => navigate("/leaderboard")}
            data-testid="profile-leaderboard-button"
          >
            Leaderboard
          </TactileButton>
          <TactileButton
            color="#22D3EE"
            size="sm"
            icon={CalendarCheck}
            onClick={() => navigate("/daily")}
            data-testid="profile-daily-button"
          >
            Daily
          </TactileButton>
          <TactileButton
            color="#F472B6"
            size="sm"
            onClick={() => navigate("/wall")}
            data-testid="profile-wall-button"
          >
            Family Wall
          </TactileButton>
          <TactileButton
            color="#FFFFFF"
            textColor="#1E293B"
            size="sm"
            icon={Home}
            onClick={() => navigate("/")}
            data-testid="profile-home-button"
          >
            Home
          </TactileButton>
        </div>

        <PortraitEditor
          open={!!editingId}
          characterId={editingId}
          onOpenChange={(v) => !v && setEditingId(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      </main>
    </div>
  );
}
