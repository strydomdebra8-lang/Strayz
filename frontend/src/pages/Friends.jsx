import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Copy,
  Trash2,
  Crown,
  Trophy,
  Coins,
  Star,
  Sprout,
  Shield,
  CalendarCheck,
} from "lucide-react";
import GameNav from "@/components/GameNav";
import ShopDrawer from "@/components/ShopDrawer";
import TactileButton from "@/components/TactileButton";
import { Input } from "@/components/ui/input";
import { CHARACTERS } from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";
import {
  listFriends,
  addFriend,
  removeFriend,
  getDuelScores,
  getPlayer,
} from "@/lib/api";
import { getPlayerId } from "@/lib/gameStore";
import { sfx, playMusic } from "@/lib/sound";
import { earn } from "@/lib/achievements";

function getChar(id) {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}

function FriendAvatar({ character_id, size = 56 }) {
  const c = getChar(character_id);
  return (
    <div
      className="rounded-2xl border-4 border-slate-900 overflow-hidden bg-white"
      style={{
        width: size,
        height: size,
        backgroundColor: (c.color || "#FBBF24") + "40",
      }}
    >
      <img
        src={resolveCharacterImage(c)}
        alt={c.name}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function Friends() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [duel, setDuel] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const playerId = getPlayerId();

  const refresh = async () => {
    const [list, scores] = await Promise.all([
      listFriends(playerId),
      getDuelScores(playerId),
    ]);
    setData(list);
    setDuel(scores);
    try {
      const p = await getPlayer(playerId);
      setPlayer(p);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("getPlayer (Friends HUD) failed:", err);
    }
  };

  useEffect(() => {
    refresh().catch(() => toast.error("Could not load friends"));
    playMusic("menu");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyCode = async () => {
    if (!data?.my_code) return;
    try {
      await navigator.clipboard.writeText(data.my_code);
      sfx.click();
      toast.success(`Copied ${data.my_code}`);
    } catch {
      toast.error("Clipboard not available");
    }
  };

  const onAdd = async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      toast.error("Enter a friend code");
      return;
    }
    setBusy(true);
    try {
      const r = await addFriend({ player_id: playerId, friend_code: clean });
      if (r.already_added) {
        toast(`${r.friend.name} is already in your crew`);
      } else {
        sfx.levelUp();
        toast.success(`Added ${r.friend.name}!`);
        if (earn("first-friend")) toast("Achievement: Buddy System!");
        if (r.friends_count >= 3 && earn("crew-of-three")) {
          toast("Achievement: Crew of Three!");
        }
      }
      setCode("");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not add");
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async (fid, name) => {
    try {
      await removeFriend(playerId, fid);
      sfx.pop();
      toast(`Removed ${name}`);
      await refresh();
    } catch {
      toast.error("Could not remove");
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <p className="font-display text-2xl text-slate-700 animate-pulse">
          Loading friends…
        </p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 0%, rgba(165,180,252,0.4), transparent 55%), radial-gradient(circle at 85% 100%, rgba(110,231,183,0.4), transparent 55%), linear-gradient(180deg, #EEF2FF 0%, #DBEAFE 100%)",
      }}
      data-testid="friends-page"
    >
      <GameNav player={player || data.me} onOpenShop={() => setShopOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <section className="text-center">
          <span className="font-accent text-indigo-700 inline-flex items-center gap-2">
            <Users className="w-4 h-4" strokeWidth={3} />
            FRIEND CODES
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 text-shadow-pop">
            Your Crew
          </h1>
          <p className="text-slate-700 font-semibold mt-2 max-w-xl mx-auto">
            Share your code, add your friends, and race them in today&apos;s
            Daily Duel.
          </p>
        </section>

        {/* My Code */}
        <section className="mt-8 max-w-md mx-auto">
          <div
            className="tactile-card bg-white p-5 text-center"
            data-testid="my-friend-code-card"
          >
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
              My friend code
            </p>
            <p
              className="font-display font-bold text-4xl text-slate-900 mt-1 select-all"
              data-testid="my-friend-code"
            >
              {data.my_code}
            </p>
            <div className="mt-3 flex justify-center">
              <TactileButton
                color="#A78BFA"
                size="md"
                icon={Copy}
                onClick={copyCode}
                data-testid="copy-friend-code-button"
              >
                Copy Code
              </TactileButton>
            </div>
          </div>
        </section>

        {/* Add Friend */}
        <section className="mt-6 max-w-md mx-auto">
          <div className="tactile-card bg-white p-4">
            <p className="font-display font-bold text-slate-900 mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" strokeWidth={3} />
              Add a friend
            </p>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="STRY-XXXX"
                maxLength={9}
                className="border-2 border-slate-800 bg-amber-50 font-mono font-bold uppercase text-lg"
                data-testid="friend-code-input"
                onKeyDown={(e) => e.key === "Enter" && onAdd()}
              />
              <TactileButton
                color="#4ADE80"
                size="md"
                icon={UserPlus}
                onClick={onAdd}
                disabled={busy}
                data-testid="add-friend-button"
              >
                Add
              </TactileButton>
            </div>
          </div>
        </section>

        {/* Daily Duel Leaderboard */}
        <section className="mt-8" data-testid="duel-leaderboard">
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-3 inline-flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-rose-600" strokeWidth={3} />
            Daily Duel — {duel?.date || "today"}
          </h2>
          <div className="space-y-2">
            {duel?.rows.length ? (
              duel.rows.map((row, i) => {
                const c = getChar(row.character_id);
                return (
                  <div
                    key={row.player_id}
                    className={`tactile-card flex items-center gap-3 p-3 ${
                      row.is_me
                        ? "bg-amber-100 border-amber-700"
                        : "bg-white"
                    }`}
                    data-testid={`duel-row-${i}`}
                  >
                    <span className="font-display font-bold text-2xl text-slate-900 w-8 text-center">
                      {i + 1}
                    </span>
                    {i === 0 && row.played && (
                      <Crown
                        className="w-5 h-5 text-amber-500"
                        strokeWidth={3}
                        fill="#FBBF24"
                      />
                    )}
                    <FriendAvatar character_id={row.character_id} size={48} />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-slate-900 truncate">
                        {row.name}
                        {row.is_me && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-300 text-slate-900 font-bold">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-600 font-semibold">
                        {c.name} • {c.role}
                      </p>
                    </div>
                    <div className="text-right">
                      {row.played ? (
                        <p
                          className="font-display font-bold text-xl text-emerald-700"
                          data-testid={`duel-score-${i}`}
                        >
                          {row.score}/{row.total}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 font-semibold">
                          not played yet
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-600 font-semibold text-center py-4">
                No scores yet. Play the Daily Challenge to log yours!
              </p>
            )}
          </div>
          <div className="text-center mt-3">
            <TactileButton
              color="#22D3EE"
              size="md"
              icon={CalendarCheck}
              onClick={() => navigate("/daily")}
              data-testid="goto-daily-button"
            >
              Play Daily Challenge
            </TactileButton>
          </div>
        </section>

        {/* Friends list */}
        <section className="mt-8">
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-3 inline-flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" strokeWidth={3} />
            My Crew ({data.friends.length})
          </h2>
          {data.friends.length === 0 ? (
            <div className="tactile-card bg-white p-6 text-center text-slate-600 font-semibold">
              No friends yet. Share your code <strong>{data.my_code}</strong> with
              someone playing Strayz!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3" data-testid="friends-list">
              {data.friends.map((f) => (
                <div
                  key={f.player_id}
                  className="tactile-card bg-white p-4 flex gap-3 items-center"
                  data-testid={`friend-${f.friend_code}`}
                >
                  <FriendAvatar character_id={f.character_id} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-slate-900 truncate">
                      {f.name}
                    </p>
                    <p className="text-[10px] font-mono font-bold text-slate-500">
                      {f.friend_code}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold text-slate-700">
                      <span className="inline-flex items-center gap-0.5">
                        <Coins className="w-3 h-3 text-amber-600" strokeWidth={3} />
                        {f.coins}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-500" strokeWidth={3} />
                        {f.stars}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Trophy className="w-3 h-3 text-orange-600" strokeWidth={3} />
                        {f.levels_completed}/6
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Sprout className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                        Lv{f.homestead_level}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Shield className="w-3 h-3 text-rose-600" strokeWidth={3} />
                        {f.raids_won}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(f.player_id, f.name)}
                    className="p-2 rounded-full hover:bg-rose-100 text-rose-600 transition"
                    aria-label={`Remove ${f.name}`}
                    data-testid={`remove-friend-${f.friend_code}`}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="text-center mt-10">
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

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={setPlayer}
      />
    </div>
  );
}
