import { useNavigate } from "react-router-dom";
import { Coins, Gem, Home, Store, Sparkles } from "lucide-react";

export default function GameNav({ player, onOpenShop, hideHome = false }) {
  const navigate = useNavigate();
  const coins = player?.coins ?? 0;
  const gems = player?.gems ?? 0;

  return (
    <nav
      className="sticky top-0 z-30 w-full bg-amber-100/85 backdrop-blur-md border-b-4 border-slate-800"
      data-testid="game-nav"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {!hideHome && (
            <button
              onClick={() => navigate("/")}
              className="tactile-btn bg-white text-slate-800 px-3 py-2 text-sm"
              data-testid="nav-home-button"
              aria-label="Home"
            >
              <Home className="w-5 h-5" strokeWidth={3} />
            </button>
          )}
          <div className="font-display font-bold text-2xl sm:text-3xl tracking-tight text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" strokeWidth={3} />
            <span>STRAYZ</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="tactile-chip text-amber-700" data-testid="coin-balance">
            <Coins className="w-4 h-4" strokeWidth={3} />
            <span>{coins}</span>
          </span>
          <span className="tactile-chip text-violet-700" data-testid="gem-balance">
            <Gem className="w-4 h-4" strokeWidth={3} />
            <span>{gems}</span>
          </span>
          <button
            onClick={onOpenShop}
            className="tactile-btn bg-pink-400 text-white px-3 py-2 text-sm"
            data-testid="nav-shop-button"
            aria-label="Shop"
          >
            <Store className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </nav>
  );
}
