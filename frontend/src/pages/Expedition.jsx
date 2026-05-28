import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Compass,
  Trophy,
  Sparkles,
  Clock,
  Gift,
  Crown,
  Check,
  X,
  ArrowRight,
  Frame,
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
  getExpedition,
  startExpeditionToday,
  resolveExpeditionToday,
  claimExpeditionTier,
  activateFrame,
  submitAnswer,
  getPlayer,
} from "@/lib/api";
import { getPlayerId, getDifficulty } from "@/lib/gameStore";
import { sfx, playMusic } from "@/lib/sound";
import { earn } from "@/lib/achievements";

function fmtCountdown(sec) {
  if (sec == null) return "";
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Expedition() {
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [player, setPlayer] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [run, setRun] = useState(null); // {puzzles, idx, correct, done}
  const [feedback, setFeedback] = useState(null);
  const playerId = getPlayerId();

  const refresh = async () => {
    const d = await getExpedition(playerId);
    setState(d);
    try {
      const p = await getPlayer(playerId);
      setPlayer(p);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("getPlayer (Expedition HUD) failed:", err);
    }
  };

  useEffect(() => {
    refresh().catch(() => toast.error("Could not load Expedition"));
    playMusic("menu");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <p className="font-display text-2xl text-slate-700 animate-pulse">
          Loading Expedition…
        </p>
      </div>
    );
  }

  const { expedition, coins, gems } = state;
  const theme = expedition.theme;

  const startToday = async () => {
    try {
      const d = await startExpeditionToday(playerId);
      setRun({
        puzzles: d.puzzles,
        idx: 0,
        correct: 0,
        done: false,
      });
      setFeedback(null);
      sfx.drop();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Could not start");
    }
  };

  const submit = async (selected) => {
    if (!run || feedback) return;
    const puzzle = run.puzzles[run.idx];
    try {
      const r = await submitAnswer({
        puzzle_id: puzzle.id,
        selected,
        difficulty: getDifficulty(),
      });
      setFeedback(r);
      if (r.correct) {
        sfx.correct();
        setRun((p) => ({ ...p, correct: p.correct + 1 }));
      } else {
        sfx.wrong();
      }
    } catch {
      toast.error("Submit failed");
    }
  };

  const next = async () => {
    if (!run) return;
    const nextIdx = run.idx + 1;
    setFeedback(null);
    if (nextIdx >= run.puzzles.length) {
      // resolve
      try {
        const r = await resolveExpeditionToday({
          player_id: playerId,
          correct: run.correct,
          total: run.puzzles.length,
        });
        setRun((p) => ({ ...p, done: true, xp_gained: r.xp_gained, total_xp: r.total_xp }));
        sfx.levelUp();
        toast.success(`+${r.xp_gained} season XP!`);
        if (earn("first-expedition")) toast("Achievement: Trailblazer!");
        await refresh();
      } catch (e) {
        toast.error(e?.response?.data?.detail || "Could not resolve");
      }
    } else {
      setRun((p) => ({ ...p, idx: nextIdx }));
    }
  };

  const claim = async (idx) => {
    try {
      const r = await claimExpeditionTier({ player_id: playerId, tier_index: idx });
      sfx.coin();
      const rewardText = r.reward.coins
        ? `+${r.reward.coins} coins`
        : r.reward.gems
        ? `+${r.reward.gems} gems`
        : `New frame unlocked!`;
      toast.success(rewardText);
      const claimedCount = expedition.tiers.filter((t) => t.claimed).length + 1;
      if (claimedCount >= 3 && earn("expedition-veteran"))
        toast("Achievement: Expedition Veteran!");
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot claim");
    }
  };

  const setFrame = async (frameId) => {
    try {
      await activateFrame({ player_id: playerId, frame_id: frameId });
      sfx.click();
      toast(`Frame set: ${frameId === "none" ? "default" : frameId}`);
      await refresh();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot activate");
    }
  };

  const maxXp = expedition.tiers[expedition.tiers.length - 1].xp;
  const progressPct = Math.min(100, (expedition.xp / maxXp) * 100);

  // Compute frame catalog: unlocked frames + default
  const frameCatalog = [
    { id: "none", name: "Default", color: "#94A3B8" },
    { id: expedition.theme_frame_id, name: `${theme.name} Frame`, color: theme.color, themed: true },
    { id: "frame-gold", name: "Golden Frame", color: "#FBBF24" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `radial-gradient(circle at 15% 0%, ${theme.color}55, transparent 55%), radial-gradient(circle at 85% 100%, ${theme.color}33, transparent 55%), linear-gradient(180deg, #0F172A 0%, #1E293B 100%)`,
      }}
      data-testid="expedition-page"
    >
      <GameNav
        player={player || { coins, gems }}
        onOpenShop={() => setShopOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <section className="text-center">
          <span className="font-accent inline-flex items-center gap-2" style={{ color: theme.color }}>
            <Compass className="w-4 h-4" strokeWidth={3} />
            STRAY EXPEDITION • {expedition.season_key}
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-white text-shadow-pop">
            <span className="mr-2" aria-hidden="true">{theme.emoji}</span>
            {theme.name}
          </h1>
          <p className="text-slate-300 font-semibold mt-2">
            A new themed quest each week. Complete daily runs to climb the season
            track and earn limited-time rewards.
          </p>
          <p
            className="mt-3 inline-flex items-center gap-2 text-amber-300 font-bold"
            data-testid="season-countdown"
          >
            <Clock className="w-4 h-4" strokeWidth={3} />
            Ends in {fmtCountdown(expedition.ends_in_seconds)}
          </p>
        </section>

        {/* XP Track */}
        <section className="mt-8" data-testid="season-track">
          <div className="flex justify-between items-end mb-2">
            <p className="text-white font-display font-bold text-xl">Season Track</p>
            <p className="text-amber-300 font-display font-bold text-2xl">
              {expedition.xp} <span className="text-sm text-slate-400">/ {maxXp} XP</span>
            </p>
          </div>
          <div className="relative h-4 bg-slate-800 rounded-full border-2 border-slate-700 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 transition-all"
              style={{
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${theme.color}, #FBBF24)`,
              }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {expedition.tiers.map((t, i) => (
              <div
                key={i}
                className={`tactile-card p-3 ${
                  t.claimed
                    ? "bg-emerald-100 border-emerald-700"
                    : t.available
                    ? "bg-amber-100 animate-pulse"
                    : "bg-slate-100"
                }`}
                data-testid={`tier-${i}`}
              >
                <p className="text-[10px] uppercase font-bold text-slate-500">
                  Tier {i + 1} • {t.xp} XP
                </p>
                <p className="font-display font-bold text-slate-900 leading-tight">
                  {t.label}
                </p>
                {t.claimed ? (
                  <p className="mt-1 text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                    <Check className="w-3 h-3" strokeWidth={3} /> Claimed
                  </p>
                ) : t.available ? (
                  <button
                    onClick={() => claim(i)}
                    className="mt-1 text-xs font-bold uppercase px-2 py-1 rounded-full bg-slate-900 text-amber-300 border-2 border-amber-500"
                    data-testid={`claim-tier-${i}`}
                  >
                    Claim
                  </button>
                ) : (
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {t.xp - expedition.xp} XP to go
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Today's run */}
        <section className="mt-8 text-center">
          <div
            className="tactile-card bg-white p-6 max-w-md mx-auto"
            data-testid="todays-run-card"
          >
            <Sparkles className="w-12 h-12 mx-auto" strokeWidth={3} style={{ color: theme.color }} />
            <h2 className="font-display font-bold text-2xl text-slate-900 mt-2">
              Today&apos;s Expedition
            </h2>
            <p className="text-slate-700 font-semibold mt-1 text-sm">
              {expedition.puzzles_per_run} {theme.name.toLowerCase()} puzzles · earn season XP
            </p>
            <div className="mt-4">
              {expedition.completed_today ? (
                <div
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-100 border-4 border-emerald-700 text-emerald-900 font-display font-bold"
                  data-testid="expedition-completed-banner"
                >
                  <Check className="w-5 h-5" strokeWidth={3} />
                  Done for today!
                </div>
              ) : (
                <TactileButton
                  color={theme.color}
                  size="lg"
                  icon={Compass}
                  onClick={startToday}
                  data-testid="start-expedition-button"
                >
                  Begin Expedition
                </TactileButton>
              )}
            </div>
          </div>
        </section>

        {/* Cosmetics gallery */}
        <section className="mt-8" data-testid="cosmetics-gallery">
          <h2 className="text-white font-display font-bold text-xl mb-3 inline-flex items-center gap-2">
            <Frame className="w-5 h-5 text-amber-300" strokeWidth={3} />
            Cosmetic Frames
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {frameCatalog.map((f) => {
              const unlocked =
                f.id === "none" || (expedition.unlocked_frames || []).includes(f.id);
              const active = (expedition.active_frame || "none") === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => unlocked && setFrame(f.id)}
                  disabled={!unlocked}
                  className={`tactile-card p-3 text-center transition ${
                    active
                      ? "bg-amber-100 border-amber-600"
                      : unlocked
                      ? "bg-white hover:bg-slate-50"
                      : "bg-slate-100 opacity-50 cursor-not-allowed"
                  }`}
                  data-testid={`frame-${f.id}`}
                >
                  <div
                    className="mx-auto w-16 h-16 rounded-2xl border-4 mb-1 flex items-center justify-center"
                    style={{ borderColor: f.color, backgroundColor: f.color + "30" }}
                  >
                    {f.id === "none" ? (
                      <X className="w-6 h-6 text-slate-500" strokeWidth={3} />
                    ) : f.id === "frame-gold" ? (
                      <Crown className="w-6 h-6 text-amber-600" strokeWidth={3} />
                    ) : (
                      <span className="text-2xl" aria-hidden="true">
                        {theme.emoji}
                      </span>
                    )}
                  </div>
                  <p className="font-display font-bold text-sm text-slate-900">
                    {f.name}
                  </p>
                  <p className="text-[10px] font-bold uppercase mt-0.5 text-slate-500">
                    {active ? "Active" : unlocked ? "Tap to equip" : "Locked"}
                  </p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-3">
            Unlock frames by claiming Tier 3 (themed) and Tier 6 (golden) on the
            season track. Frames appear on your character portrait across the game.
          </p>
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

      {/* Expedition run modal */}
      <Dialog open={!!run} onOpenChange={(v) => !v && setRun(null)}>
        <DialogContent
          className="bg-slate-900 border-4 rounded-3xl max-w-xl text-white"
          style={{ borderColor: theme.color }}
          data-testid="expedition-dialog"
        >
          <DialogHeader>
            <DialogTitle
              className="font-display text-2xl flex items-center gap-2"
              style={{ color: theme.color }}
            >
              <span aria-hidden="true">{theme.emoji}</span>
              {theme.name}
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Answer correctly to earn extra season XP.
            </DialogDescription>
          </DialogHeader>

          {run && !run.done && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-amber-300 font-display font-bold">
                <span data-testid="exp-progress">
                  {run.idx + 1} / {run.puzzles.length}
                </span>
                <span>Correct: {run.correct}</span>
              </div>
              <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 p-4">
                <p className="text-xs uppercase font-bold tracking-wider" style={{ color: theme.color }}>
                  {run.puzzles[run.idx].category}
                </p>
                <h3
                  className="font-display font-bold text-lg text-white mt-1"
                  data-testid="exp-question"
                >
                  {run.puzzles[run.idx].question}
                </h3>
                <div className="mt-3">
                  <TriviaPuzzle
                    puzzle={run.puzzles[run.idx]}
                    onSubmit={submit}
                    locked={!!feedback}
                  />
                </div>
              </div>

              {feedback && (
                <div
                  className={`rounded-2xl border-4 p-4 ${
                    feedback.correct
                      ? "bg-emerald-100 border-emerald-700 text-emerald-900"
                      : "bg-rose-100 border-rose-700 text-rose-900"
                  }`}
                  data-testid="exp-feedback"
                >
                  <div className="flex items-center gap-2 font-display font-bold">
                    {feedback.correct ? (
                      <>
                        <Check className="w-5 h-5" strokeWidth={3} /> Right!
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" strokeWidth={3} /> Answer: {feedback.correct_answer}
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
                    data-testid="exp-next-button"
                  >
                    {run.idx + 1 >= run.puzzles.length ? "Finish" : "Next"}
                  </TactileButton>
                </div>
              )}
            </div>
          )}

          {run?.done && (
            <div className="text-center py-4 space-y-3" data-testid="exp-result">
              <Trophy className="w-16 h-16 mx-auto text-amber-400" strokeWidth={3} />
              <h2 className="font-display font-bold text-3xl text-amber-300">
                Expedition complete!
              </h2>
              <p className="text-slate-300">
                {run.correct} of {run.puzzles.length} correct
              </p>
              <p className="font-display font-bold text-emerald-400 text-xl inline-flex items-center gap-2">
                <Gift className="w-5 h-5" strokeWidth={3} />
                +{run.xp_gained} Season XP
              </p>
              <TactileButton color="#38BDF8" onClick={() => setRun(null)} data-testid="exp-close-button">
                Continue
              </TactileButton>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={setPlayer}
      />
    </div>
  );
}
