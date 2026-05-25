import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Coins, Gem, Star, X } from "lucide-react";
import { toast } from "sonner";
import TactileButton from "@/components/TactileButton";
import { getShopPacks, purchasePack } from "@/lib/api";
import { getPlayerId } from "@/lib/gameStore";
import { BACKGROUNDS } from "@/data/storyData";

export default function ShopDrawer({ open, onOpenChange, onPlayerUpdate }) {
  const [packs, setPacks] = useState([]);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (open && packs.length === 0) {
      getShopPacks().then((d) => setPacks(d.packs)).catch(() => {});
    }
  }, [open, packs.length]);

  const buy = async (pack) => {
    setBusyId(pack.id);
    try {
      const res = await purchasePack({
        player_id: getPlayerId(),
        pack_id: pack.id,
      });
      toast.success(`+${pack.coins} coins, +${pack.gems} gems!`, {
        description: "Mock purchase — no real money charged.",
      });
      onPlayerUpdate?.(res.player);
    } catch {
      toast.error("Purchase failed. Try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-amber-100 border-l-4 border-slate-800 p-0"
        data-testid="shop-drawer"
      >
        <div
          className="px-6 py-4 border-b-4 border-slate-800 bg-gradient-to-r from-pink-400 to-amber-400"
        >
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="font-display text-2xl text-white text-shadow-pop">
              Treasure Shop
            </SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="tactile-btn bg-white text-slate-800 px-2 py-2"
              data-testid="shop-close-button"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </SheetHeader>
          <p className="mt-2 text-white/90 text-sm font-semibold">
            All purchases are MOCK — no real charges.
          </p>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-110px)]">
          <div className="tactile-card p-4 flex items-center gap-4 bg-white">
            <img
              src={BACKGROUNDS.treasure}
              alt="treasure"
              className="w-16 h-16 rounded-2xl border-2 border-slate-800 object-cover"
            />
            <p className="text-sm leading-relaxed">
              Spend coins on <strong>hints</strong> & continue plays. Gems unlock
              cosmetic flair.
            </p>
          </div>

          {packs.map((p) => (
            <div
              key={p.id}
              className="tactile-card p-5 relative"
              style={{ backgroundColor: p.color + "20" }}
              data-testid={`shop-pack-${p.id}`}
            >
              {p.popular && (
                <span
                  className="absolute -top-3 -right-3 px-3 py-1 text-xs font-bold uppercase border-2 border-slate-800 rounded-full bg-amber-400 text-slate-900"
                  data-testid={`popular-badge-${p.id}`}
                >
                  <Star className="w-3 h-3 inline mr-1" strokeWidth={3} />
                  Popular
                </span>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900">
                    {p.name}
                  </h3>
                  <div className="flex gap-3 mt-2 text-sm font-bold">
                    {p.coins > 0 && (
                      <span className="flex items-center gap-1 text-amber-700">
                        <Coins className="w-4 h-4" strokeWidth={3} /> {p.coins}
                      </span>
                    )}
                    {p.gems > 0 && (
                      <span className="flex items-center gap-1 text-violet-700">
                        <Gem className="w-4 h-4" strokeWidth={3} /> {p.gems}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-accent text-2xl text-slate-900">
                  {p.price}
                </span>
              </div>
              <TactileButton
                color={p.color}
                size="md"
                className="w-full mt-4"
                onClick={() => buy(p)}
                disabled={busyId === p.id}
                data-testid={`buy-pack-${p.id}`}
              >
                {busyId === p.id ? "Processing…" : "Get Pack"}
              </TactileButton>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
