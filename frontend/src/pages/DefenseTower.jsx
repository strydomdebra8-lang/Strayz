import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Shield,
  ShieldAlert,
  Swords,
  Heart,
  Hammer,
  Crown,
  Coins,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import GameNav from "@/components/GameNav";
import ShopDrawer from "@/components/ShopDrawer";
import TactileButton from "@/components/TactileButton";
import TriviaPuzzle from "@/components/TriviaPuzzle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getDefense,
  upgradeWall,
  startRaid,
  resolveRaid,
  submitAnswer,
  getPlayer,
} from "@/lib/api";
import { getPlayerId, getDifficulty } from "@/lib/gameStore";
import { sfx, playMusic } from "@/lib/sound";
import { earn } from "@/lib/achievements";

export default function DefenseTower() {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [player, setPlayer] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [raid, setRaid] = useState(null); // { puzzles, idx, shields, max_shields, correct, done, survived }
  const [feedback, setFeedback] = useState(null);
  const playerId = getPlayerId();

  const refresh = async () => {
    const d = await getDefense(playerId);
    setState(d);
    try {
      const p = await getPlayer(playerId);
      setPlayer(p);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("getPlayer (DefenseTower HUD) failed:", err);
    }
  };

  useEffect(() => {
    refresh().catch(() => toast.error("Could not load Defense Tower"));
    playMusic("menu");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onUpgrade = async () => {
    try {
      const d = await upgradeWall({ player_id: playerId });
      setState((s) => ({ ...s, ...d }));
      sfx.levelUp();
      toast.success(`Wall upgraded to Lv ${d.defense.wall_level}!`);
      if (d.defense.wall_level >= 3 && earn("wall-fortress")) {
        toast("Achievement: Fortress Keeper!");
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot upgrade");
    }
  };

  const onStartRaid = async () => {
    try {
      const d = await startRaid(playerId);
      setRaid({
        puzzles: d.puzzles,
        idx: 0,
        shields: d.max_shields,
        max_shields: d.max_shields,
        correct: 0,
        done: false,
        survived: null,
        wall_level: d.wall_level,
        reward: d.raid_reward,
      });
      setFeedback(null);
      sfx.drop();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot start raid");
    }
  };

  const submit = async (selected) => {
    if (!raid || feedback) return;
    const puzzle = raid.puzzles[raid.idx];
    try {
      const r = await submitAnswer({
        puzzle_id: puzzle.id,
        selected,
        difficulty: getDifficulty(),
      });
      setFeedback(r);
      if (r.correct) {
        sfx.correct();
        setRaid((p) => ({ ...p, correct: p.correct + 1 }));
      } else {
        sfx.wrong();
        setRaid((p) => ({ ...p, shields: Math.max(0, p.shields - 1) }));
      }
    } catch {
      toast.error("Submit failed");
    }
  };

  const next = async () => {
    if (!raid) return;
    const nextIdx = raid.idx + 1;
    const noShields = raid.shields <= 0;
    const finished = nextIdx >= raid.puzzles.length;
    setFeedback(null);
    if (finished || noShields) {
      // resolve raid
      const survived = !noShields;
      try {
        const r = await resolveRaid({
          player_id: playerId,
          correct: raid.correct,
          survived,
        });
        setRaid((p) => ({ ...p, done: true, survived: r.survived }));
        if (survived) {
          sfx.levelUp();
          toast.success(`Raid survived! +${r.reward} coins`);
          if (earn("first-raid-win")) toast("Achievement: Castle Defender!");
        } else {
          sfx.wrong();
          toast.error("The walls have fallen…");
        }
        // refresh state
        await refresh();
      } catch (e) {
        toast.error(e?.response?.data?.detail || "Resolve failed");
      }
    } else {
      setRaid((p) => ({ ...p, idx: nextIdx }));
    }
  };

  const closeRaid = () => {
    setRaid(null);
    setFeedback(null);
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <p className="font-display text-2xl text-slate-700 animate-pulse">
          Loading Tower…
        </p>
      </div>
    );
  }

  const wallLv = state.defense.wall_level;
  const bricksPerRow = 5;
  const wallRows = wallLv;
  const navPlayer = { ...(player || {}), coins: state.coins, gems: state.gems };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(248,113,113,0.35), transparent 55%), radial-gradient(circle at 80% 100%, rgba(168,85,247,0.35), transparent 55%), linear-gradient(180deg, #1E1B4B 0%, #312E81 100%)",
      }}
      data-testid="defense-page"
    >
      <GameNav player={navPlayer} onOpenShop={() => setShopOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <section className="text-center">
          <span className="font-accent text-rose-300 inline-flex items-center gap-2">
            <Swords className="w-4 h-4" strokeWidth={3} />
            STRAYZ DEFENSE TOWER
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-white text-shadow-pop">
            Defend the Homestead
          </h1>
          <p className="text-slate-200 font-semibold mt-2 max-w-xl mx-auto">
            Raiders march on your walls. Answer puzzles to fend them off. Lose all
            shields and the raid is lost — survive to collect coins. Upgrade walls
            for stronger defenses.
          </p>
        </section>

        {/* Wall Visualization */}
        <section className="mt-8 flex flex-col items-center" data-testid="wall-visual">
          <div className="bg-slate-800/40 backdrop-blur rounded-3xl border-4 border-slate-900 p-6 sm:p-8 inline-block">
            <div className="flex flex-col items-center gap-1">
              {/* Banner */}
              <div className="flex items-center gap-1 -mb-1">
                <span className="text-2xl" aria-hidden="true">🏰</span>
                <span className="font-display font-bold text-white text-lg">
                  Lv {wallLv}
                </span>
              </div>
              {/* Brick rows */}
              {Array.from({ length: wallRows }).map((_, r) => (
                <div key={r} className="flex gap-1" style={{ marginLeft: r % 2 ? 12 : 0 }}>
                  {Array.from({ length: bricksPerRow }).map((_, b) => (
                    <div
                      key={b}
                      className="w-10 h-6 sm:w-12 sm:h-7 rounded-md border-2 border-amber-950"
                      style={{
                        backgroundColor: ["#92400E", "#B45309", "#A16207"][
                          (r + b) % 3
                        ],
                        boxShadow: "inset -2px -2px 0 rgba(0,0,0,0.25)",
                      }}
                    />
                  ))}
                </div>
              ))}
              {/* Ground */}
              <div className="mt-2 w-full h-2 rounded-full bg-emerald-600/60" />
            </div>
          </div>

          {/* Shields */}
          <div
            className="mt-5 inline-flex items-center gap-2 bg-white/95 px-5 py-3 rounded-full border-4 border-slate-900 tactile-shadow"
            data-testid="shields-hud"
          >
            <Shield className="w-5 h-5 text-rose-600" strokeWidth={3} />
            <span className="font-display font-bold text-slate-900">
              {state.max_shields} Shields
            </span>
          </div>
        </section>

        {/* Action buttons */}
        <section className="mt-8 flex flex-wrap justify-center gap-4">
          <TactileButton
            color="#EF4444"
            size="xl"
            icon={Swords}
            onClick={onStartRaid}
            data-testid="start-raid-button"
          >
            Start Raid (+{state.raid_reward}c)
          </TactileButton>
          {state.next_wall_cost > 0 ? (
            <TactileButton
              color="#FB923C"
              textColor="#1E293B"
              size="xl"
              icon={Hammer}
              onClick={onUpgrade}
              disabled={state.coins < state.next_wall_cost}
              data-testid="upgrade-wall-button"
            >
              Upgrade Wall ({state.next_wall_cost}c)
            </TactileButton>
          ) : (
            <div
              className="tactile-card bg-amber-200 px-6 py-3 flex items-center gap-2 font-display font-bold text-slate-900"
              data-testid="wall-max"
            >
              <Crown className="w-5 h-5 text-amber-700" strokeWidth={3} />
              Wall at Max Level
            </div>
          )}
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <div className="tactile-card bg-white p-4 text-center" data-testid="stat-raids-won">
            <p className="text-[10px] uppercase font-bold text-slate-500">Raids Won</p>
            <p className="font-display font-bold text-2xl text-emerald-700">
              {state.defense.raids_won}
            </p>
          </div>
          <div className="tactile-card bg-white p-4 text-center" data-testid="stat-raids-lost">
            <p className="text-[10px] uppercase font-bold text-slate-500">Raids Lost</p>
            <p className="font-display font-bold text-2xl text-rose-700">
              {state.defense.raids_lost}
            </p>
          </div>
          <div className="tactile-card bg-white p-4 text-center" data-testid="stat-wall-level">
            <p className="text-[10px] uppercase font-bold text-slate-500">Wall</p>
            <p className="font-display font-bold text-2xl text-slate-900">
              Lv {state.defense.wall_level}/{state.max_wall_level}
            </p>
          </div>
          <div className="tactile-card bg-white p-4 text-center" data-testid="stat-reward">
            <p className="text-[10px] uppercase font-bold text-slate-500">Next Reward</p>
            <p className="font-display font-bold text-2xl text-amber-700 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4" strokeWidth={3} />
              {state.raid_reward}
            </p>
          </div>
        </section>

        <div className="text-center mt-10">
          <TactileButton
            color="#38BDF8"
            size="md"
            onClick={() => navigate("/")}
            data-testid="back-to-menu"
          >
            Back to Menu
          </TactileButton>
        </div>
      </main>

      {/* Raid Modal */}
      <Dialog open={!!raid} onOpenChange={(v) => !v && closeRaid()}>
        <DialogContent
          className="bg-slate-900 border-4 border-amber-500 rounded-3xl max-w-xl text-white"
          data-testid="raid-dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-amber-300 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" strokeWidth={3} />
              Raid in Progress
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Answer correctly to repel the raiders. Each wrong answer costs you a shield.
            </DialogDescription>
          </DialogHeader>

          {raid && !raid.done && (
            <div className="space-y-4">
              {/* HUD */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1" data-testid="raid-shields">
                  {Array.from({ length: raid.max_shields }).map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-6 h-6 ${
                        i < raid.shields ? "text-rose-500" : "text-slate-700"
                      }`}
                      strokeWidth={3}
                      fill={i < raid.shields ? "#F43F5E" : "transparent"}
                    />
                  ))}
                </div>
                <span
                  className="font-display font-bold text-amber-300"
                  data-testid="raid-progress"
                >
                  {raid.idx + 1} / {raid.puzzles.length}
                </span>
              </div>

              {/* Puzzle */}
              <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-4">
                <p className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  {raid.puzzles[raid.idx].category}
                </p>
                <h3
                  className="font-display font-bold text-lg text-white mt-1"
                  data-testid="raid-question"
                >
                  {raid.puzzles[raid.idx].question}
                </h3>
                <div className="mt-3">
                  <TriviaPuzzle
                    puzzle={raid.puzzles[raid.idx]}
                    onSubmit={submit}
                    locked={!!feedback}
                  />
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div
                  className={`rounded-2xl border-4 p-4 ${
                    feedback.correct
                      ? "bg-emerald-100 border-emerald-700 text-emerald-900"
                      : "bg-rose-100 border-rose-700 text-rose-900"
                  }`}
                  data-testid="raid-feedback"
                >
                  <div className="flex items-center gap-2 font-display font-bold">
                    {feedback.correct ? (
                      <>
                        <Check className="w-5 h-5" strokeWidth={3} />
                        Repelled!
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" strokeWidth={3} />
                        Shield down! Answer: {feedback.correct_answer}
                      </>
                    )}
                  </div>
                  <p className="text-sm mt-1">{feedback.explanation}</p>
                </div>
              )}

              {feedback && (
                <div className="text-right">
                  <TactileButton
                    color="#FB923C"
                    textColor="#1E293B"
                    size="md"
                    icon={ArrowRight}
                    onClick={next}
                    data-testid="raid-next-button"
                  >
                    {raid.idx + 1 >= raid.puzzles.length || raid.shields <= 0
                      ? "End Raid"
                      : "Next Wave"}
                  </TactileButton>
                </div>
              )}
            </div>
          )}

          {raid?.done && (
            <div className="text-center py-4 space-y-3" data-testid="raid-result">
              {raid.survived ? (
                <>
                  <Crown className="w-16 h-16 mx-auto text-amber-400" strokeWidth={3} />
                  <h2 className="font-display font-bold text-3xl text-amber-300">
                    Raid Survived!
                  </h2>
                  <p className="text-slate-300">
                    You answered {raid.correct} of {raid.puzzles.length} correctly and
                    kept your walls standing.
                  </p>
                  <p className="font-display font-bold text-emerald-400 text-xl">
                    +{state?.raid_reward || raid.reward} coins
                  </p>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-16 h-16 mx-auto text-rose-500" strokeWidth={3} />
                  <h2 className="font-display font-bold text-3xl text-rose-400">
                    Walls Have Fallen
                  </h2>
                  <p className="text-slate-300">
                    The raiders pushed through. Upgrade your walls for stronger
                    defenses next time.
                  </p>
                </>
              )}
              <TactileButton color="#38BDF8" onClick={closeRaid} data-testid="raid-close-button">
                Continue
              </TactileButton>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={(p) => {
          setPlayer(p);
          setState((s) => ({ ...s, coins: p.coins, gems: p.gems }));
        }}
      />
    </div>
  );
}
