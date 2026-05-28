import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Crown, Star, Coins, Home } from "lucide-react";
import GameNav from "@/components/GameNav";
import ShopDrawer from "@/components/ShopDrawer";
import TactileButton from "@/components/TactileButton";
import { CHARACTERS } from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";
import client from "@/lib/api";
import { getPlayerId } from "@/lib/gameStore";

const MEDAL_COLORS = ["#FBBF24", "#94A3B8", "#B45309"];

export default function Leaderboard() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shopOpen, setShopOpen] = useState(false);

  useEffect(() => {
    client
      .get("/leaderboard", { params: { limit: 15 } })
      .then((r) => setRows(r.data.rows || []))
      .finally(() => setLoading(false));
  }, []);

  const myId = getPlayerId();

  return (
    <div
      className="min-h-screen bg-amber-100"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(251,191,36,0.4), transparent 50%), radial-gradient(circle at 80% 80%, rgba(56,189,248,0.4), transparent 50%)",
      }}
      data-testid="leaderboard-page"
    >
      <GameNav player={null} onOpenShop={() => setShopOpen(true)} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <span className="font-accent text-amber-700">HALL OF FAME</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 text-shadow-pop">
            Leaderboard
          </h1>
          <p className="text-slate-700 font-semibold mt-2">
            Top Strayz around the world by coins earned.
          </p>
        </div>

        {loading ? (
          <div className="mt-8 text-center text-slate-600 font-bold animate-pulse">
            Loading rankings…
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-8 text-center text-slate-600 font-bold">
            No players yet. Be the first!
          </div>
        ) : (
          <ol className="mt-6 space-y-3" data-testid="leaderboard-rows">
            {rows.map((r, i) => {
              const character = CHARACTERS.find(
                (c) => c.id === r.selected_character
              ) || CHARACTERS[0];
              const isMe = r.player_id === myId;
              const medal = MEDAL_COLORS[i] || null;
              return (
                <li
                  key={r.player_id}
                  className={`tactile-card p-3 sm:p-4 flex items-center gap-3 ${
                    isMe ? "ring-4 ring-amber-300" : ""
                  }`}
                  style={{
                    backgroundColor: isMe ? "#FEF3C7" : "#FFFFFF",
                  }}
                  data-testid={`leaderboard-row-${i}`}
                >
                  <span
                    className="w-10 h-10 rounded-full border-2 border-slate-800 flex items-center justify-center font-display font-bold"
                    style={{
                      backgroundColor: medal || "#fff",
                      color: medal ? "#1E293B" : "#1E293B",
                    }}
                  >
                    {i + 1}
                  </span>
                  <img
                    src={resolveCharacterImage(character)}
                    alt={character.name}
                    className="w-12 h-12 rounded-xl border-2 border-slate-800 object-cover"
                    style={{ backgroundColor: character.color + "30" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-slate-900 truncate">
                      {r.name} {isMe && <span className="text-xs">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-700">
                      {character.name} • {r.levels_completed} levels
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-700 flex items-center gap-1 justify-end">
                      <Coins className="w-4 h-4" strokeWidth={3} /> {r.coins}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 justify-end">
                      <Star className="w-3 h-3" strokeWidth={3} fill="#FBBF24" />
                      {r.stars}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-6 text-center">
          <TactileButton
            color="#FFFFFF"
            textColor="#1E293B"
            icon={Home}
            onClick={() => navigate("/")}
            data-testid="leaderboard-back"
          >
            Back Home
          </TactileButton>
        </div>
      </main>

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={() => {}}
      />
    </div>
  );
}
