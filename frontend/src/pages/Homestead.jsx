import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sprout,
  Home as HomeIcon,
  PlusSquare,
  Zap,
  Star,
  Lock,
  Coins,
  Gem,
  Sparkles,
} from "lucide-react";
import GameNav from "@/components/GameNav";
import ShopDrawer from "@/components/ShopDrawer";
import TactileButton from "@/components/TactileButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getHomestead,
  plantCrop,
  harvestCrop,
  boostCrop,
  expandHomestead,
  getPlayer,
} from "@/lib/api";
import { getPlayerId } from "@/lib/gameStore";
import { sfx, playMusic } from "@/lib/sound";
import { earn } from "@/lib/achievements";

function fmtTime(sec) {
  if (sec == null) return "";
  const s = Math.max(0, Math.floor(sec));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m}m ${r.toString().padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, "0")}m`;
}

export default function Homestead() {
  const navigate = useNavigate();
  const [home, setHome] = useState(null);
  const [crops, setCrops] = useState([]);
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [picking, setPicking] = useState(null); // plot index when planting
  const [shopOpen, setShopOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [tick, setTick] = useState(0);

  const playerId = getPlayerId();

  const refresh = async () => {
    const d = await getHomestead(playerId);
    setHome(d.homestead);
    setCrops(d.crops);
    setCoins(d.coins);
    setGems(d.gems);
    // also pull player for nav coin/gem display consistency
    try {
      const p = await getPlayer(playerId);
      setPlayer(p);
    } catch {}
  };

  useEffect(() => {
    refresh().catch(() => toast.error("Could not load Homestead"));
    playMusic("menu");
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live countdown: recompute remaining on each tick from planted_at
  const liveHome = useMemo(() => {
    if (!home) return null;
    const nowTs = Date.now() / 1000;
    const cropMap = Object.fromEntries(crops.map((c) => [c.id, c]));
    return {
      ...home,
      plots: home.plots.map((p) => {
        if (!p.crop || !p.planted_at) return p;
        const def = cropMap[p.crop];
        if (!def) return p;
        const remaining = Math.max(
          0,
          Math.floor(def.duration - (nowTs - p.planted_at))
        );
        return { ...p, remaining };
      }),
    };
    // tick triggers recompute
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [home, crops, tick]);

  const onPlant = async (cropId) => {
    if (picking == null) return;
    try {
      const d = await plantCrop({
        player_id: playerId,
        plot_index: picking,
        crop_id: cropId,
      });
      setHome(d.homestead);
      setCoins(d.coins);
      setGems(d.gems);
      sfx.pop();
      setPicking(null);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot plant");
    }
  };

  const onHarvest = async (idx) => {
    try {
      const d = await harvestCrop({ player_id: playerId, plot_index: idx });
      setHome(d.homestead);
      setCoins(d.coins);
      setGems(d.gems);
      sfx.coin();
      toast.success(`+${d.reward} coins • +${d.xp_gained} XP`);
      if (earn("first-harvest")) toast("Achievement: Green Thumb!");
      if (d.homestead.level >= 3 && earn("homestead-level-3"))
        toast("Achievement: Master Farmer!");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot harvest");
    }
  };

  const onBoost = async (idx) => {
    try {
      const d = await boostCrop({ player_id: playerId, plot_index: idx });
      setHome(d.homestead);
      setCoins(d.coins);
      setGems(d.gems);
      sfx.levelUp();
      toast.success("Crop boosted!");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot boost");
    }
  };

  const onExpand = async () => {
    try {
      const d = await expandHomestead({ player_id: playerId });
      setHome(d.homestead);
      setCoins(d.coins);
      setGems(d.gems);
      sfx.levelUp();
      toast.success("New plot unlocked!");
      if (earn("homestead-expanded")) toast("Achievement: Land Baron!");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Cannot expand");
    }
  };

  if (!liveHome) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <p className="font-display text-2xl text-slate-700 animate-pulse">
          Loading Homestead…
        </p>
      </div>
    );
  }

  const navPlayer = { coins, gems, ...(player || {}) };

  const cropMap = Object.fromEntries(crops.map((c) => [c.id, c]));

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 0%, rgba(167,243,208,0.95), transparent 50%), radial-gradient(circle at 85% 100%, rgba(254,215,170,0.95), transparent 55%), linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)",
      }}
      data-testid="homestead-page"
    >
      <GameNav player={{ ...navPlayer }} onOpenShop={() => setShopOpen(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <section className="text-center">
          <span className="font-accent text-emerald-700 inline-flex items-center gap-2">
            <Sprout className="w-4 h-4" strokeWidth={3} />
            STRAYZ HOMESTEAD
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-6xl text-slate-900 text-shadow-pop">
            Your Family Farm
          </h1>
          <p className="text-slate-700 font-semibold mt-2 max-w-xl mx-auto">
            Plant crops, wait for them to grow, then harvest for coins &amp; XP.
            Expand your homestead to unlock rarer crops!
          </p>

          {/* Stats */}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <div
              className="tactile-card bg-white px-5 py-3 flex items-center gap-2"
              data-testid="home-level"
            >
              <Star className="w-5 h-5 text-amber-500" strokeWidth={3} fill="#FBBF24" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Homestead
                </div>
                <div className="font-display font-bold text-xl text-slate-900">
                  Lv {liveHome.level}
                </div>
              </div>
            </div>
            <div
              className="tactile-card bg-white px-5 py-3 flex items-center gap-2"
              data-testid="home-xp"
            >
              <Sparkles className="w-5 h-5 text-violet-500" strokeWidth={3} />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500">XP</div>
                <div className="font-display font-bold text-xl text-slate-900">
                  {liveHome.xp}
                </div>
              </div>
            </div>
            <div
              className="tactile-card bg-white px-5 py-3 flex items-center gap-2"
              data-testid="home-plots"
            >
              <HomeIcon className="w-5 h-5 text-emerald-600" strokeWidth={3} />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Plots
                </div>
                <div className="font-display font-bold text-xl text-slate-900">
                  {liveHome.unlocked}/{liveHome.max_plots}
                </div>
              </div>
            </div>
            {liveHome.next_expand_cost > 0 && (
              <TactileButton
                color="#FB923C"
                textColor="#1E293B"
                size="md"
                icon={PlusSquare}
                onClick={onExpand}
                data-testid="expand-homestead-button"
              >
                Expand ({liveHome.next_expand_cost}c)
              </TactileButton>
            )}
          </div>
        </section>

        {/* Plot grid */}
        <section
          className="mt-8 grid grid-cols-3 gap-3 sm:gap-5 max-w-2xl mx-auto"
          data-testid="plot-grid"
        >
          {liveHome.plots.map((plot, idx) => {
            const def = plot.crop ? cropMap[plot.crop] : null;
            const ready = def && plot.remaining === 0;
            const growing = def && plot.remaining > 0;
            const progress = def
              ? Math.min(1, 1 - plot.remaining / def.duration)
              : 0;

            if (!plot.unlocked) {
              return (
                <div
                  key={idx}
                  className="aspect-square rounded-3xl border-4 border-dashed border-slate-400 bg-slate-200/60 flex flex-col items-center justify-center text-slate-500 gap-1"
                  data-testid={`plot-${idx}`}
                >
                  <Lock className="w-7 h-7" strokeWidth={3} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Locked
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 inline-flex items-center gap-1">
                    <Coins className="w-3 h-3" strokeWidth={3} />
                    {plot.expand_cost}
                  </span>
                </div>
              );
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  if (ready) onHarvest(idx);
                  else if (!def) setPicking(idx);
                }}
                className={`relative aspect-square rounded-3xl border-4 border-slate-800 overflow-hidden text-center transition-transform active:scale-95 ${
                  ready
                    ? "bg-emerald-200 animate-pulse"
                    : growing
                    ? "bg-amber-100"
                    : "bg-lime-100 hover:bg-lime-200"
                }`}
                data-testid={`plot-${idx}`}
                style={{ boxShadow: "0 6px 0 0 #1E293B" }}
              >
                {/* soil pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #92400E 0 2px, transparent 2px 14px)",
                  }}
                />

                {/* Content */}
                <div className="relative h-full w-full flex flex-col items-center justify-center gap-1 px-2">
                  {!def && (
                    <>
                      <Sprout className="w-9 h-9 text-emerald-700" strokeWidth={3} />
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        Plant
                      </span>
                    </>
                  )}
                  {def && (
                    <>
                      <span
                        className={`text-4xl sm:text-5xl ${
                          ready ? "animate-bounce" : ""
                        }`}
                        aria-hidden="true"
                      >
                        {def.emoji}
                      </span>
                      {growing && (
                        <span className="text-xs font-bold text-slate-700">
                          {fmtTime(plot.remaining)}
                        </span>
                      )}
                      {ready && (
                        <span className="text-xs font-display font-bold text-emerald-900 uppercase">
                          Harvest!
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Progress bar */}
                {growing && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-300">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                )}

                {/* Boost button for growing crops */}
                {growing && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBoost(idx);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onBoost(idx);
                      }
                    }}
                    className="absolute top-1.5 right-1.5 w-8 h-8 rounded-full bg-violet-500 text-white border-2 border-slate-900 flex items-center justify-center hover:bg-violet-600 cursor-pointer"
                    data-testid={`boost-plot-${idx}`}
                    aria-label="Boost with gems"
                  >
                    <Zap className="w-4 h-4" strokeWidth={3} fill="white" />
                  </span>
                )}
              </button>
            );
          })}
        </section>

        {/* Crop catalog hint */}
        <section className="mt-8 max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-slate-900 mb-3">
            Crop Catalog
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {crops.map((c) => {
              const locked = (c.unlock_level || 1) > liveHome.level;
              return (
                <div
                  key={c.id}
                  className={`tactile-card p-3 ${
                    locked ? "bg-slate-100 opacity-70" : "bg-white"
                  }`}
                  data-testid={`crop-info-${c.id}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-3xl" aria-hidden="true">
                      {c.emoji}
                    </span>
                    <div>
                      <p className="font-display font-bold text-slate-900 leading-tight">
                        {c.name}
                      </p>
                      <p className="text-[10px] uppercase font-bold text-slate-500">
                        {fmtTime(c.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs font-bold text-slate-700">
                    <span className="inline-flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-600" strokeWidth={3} />
                      {c.cost} → {c.reward}
                    </span>
                    {locked && (
                      <span className="inline-flex items-center gap-1 text-rose-700">
                        <Lock className="w-3 h-3" strokeWidth={3} />
                        Lv{c.unlock_level}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
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

      {/* Plant crop picker */}
      <Dialog open={picking !== null} onOpenChange={(v) => !v && setPicking(null)}>
        <DialogContent
          className="bg-amber-50 border-4 border-slate-800 rounded-3xl max-w-md"
          data-testid="plant-dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              Plant a Crop
            </DialogTitle>
            <DialogDescription className="text-slate-700">
              Choose a crop to plant. Each crop costs coins and rewards you when it&apos;s ready to harvest.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2">
            {crops.map((c) => {
              const locked = (c.unlock_level || 1) > liveHome.level;
              const tooPoor = coins < c.cost;
              const disabled = locked || tooPoor;
              return (
                <button
                  key={c.id}
                  onClick={() => !disabled && onPlant(c.id)}
                  disabled={disabled}
                  className={`tactile-card p-3 text-left flex items-center gap-3 transition ${
                    disabled
                      ? "bg-slate-100 opacity-70 cursor-not-allowed"
                      : "bg-white hover:bg-amber-50"
                  }`}
                  data-testid={`plant-option-${c.id}`}
                >
                  <span className="text-4xl" aria-hidden="true">
                    {c.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-slate-900">
                      {c.name}
                    </p>
                    <div className="text-xs text-slate-600 font-semibold flex flex-wrap gap-x-3">
                      <span>⏱ {fmtTime(c.duration)}</span>
                      <span>💰 -{c.cost} / +{c.reward}</span>
                      <span>✨ +{c.xp}xp</span>
                    </div>
                  </div>
                  {locked && (
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-100 border-2 border-rose-700 text-rose-900 font-bold">
                      Lv{c.unlock_level}
                    </span>
                  )}
                  {!locked && tooPoor && (
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-200 border-2 border-slate-500 text-slate-700 font-bold">
                      Need coins
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 mt-2 inline-flex items-center gap-2">
            <Coins className="w-3 h-3 text-amber-600" strokeWidth={3} /> {coins}
            <Gem className="w-3 h-3 text-violet-600 ml-3" strokeWidth={3} /> {gems}
          </p>
        </DialogContent>
      </Dialog>

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={(p) => {
          setPlayer(p);
          setCoins(p.coins || 0);
          setGems(p.gems || 0);
        }}
      />
    </div>
  );
}
