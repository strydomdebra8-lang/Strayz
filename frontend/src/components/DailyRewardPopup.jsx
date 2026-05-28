import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Coins, Flame, Gift } from "lucide-react";
import TactileButton from "@/components/TactileButton";
import client from "@/lib/api";
import { sfx } from "@/lib/sound";
import { getPlayerId } from "@/lib/gameStore";

export default function DailyRewardPopup({ onClaimed }) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const sessionKey = "strayz_login_checked";
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
    client
      .get(`/login-streak/${getPlayerId()}`)
      .then((r) => {
        setInfo(r.data);
        if (r.data.can_claim) setOpen(true);
      })
      .catch(() => {});
  }, []);

  const claim = async () => {
    setBusy(true);
    try {
      const r = await client.post("/login-streak/claim", {
        player_id: getPlayerId(),
      });
      sfx.coin();
      sfx.levelUp();
      onClaimed?.(r.data.player);
      setOpen(false);
    } catch {
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  if (!info || !info.can_claim) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="bg-gradient-to-br from-amber-200 to-pink-200 border-4 border-slate-800 rounded-3xl max-w-sm"
        data-testid="daily-reward-popup"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-600" strokeWidth={3} />
            Daily Reward
          </DialogTitle>
          <DialogDescription className="text-slate-800 font-semibold">
            Welcome back, Stray! Here's today's gift.
          </DialogDescription>
        </DialogHeader>
        <div className="text-center space-y-4 py-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-300 border-2 border-slate-800">
            <Flame className="w-5 h-5 text-rose-600" strokeWidth={3} />
            <span className="font-display font-bold text-slate-900">
              {info.next_streak}-day streak
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 font-accent text-4xl text-amber-800 animate-celebrate">
            <Coins className="w-10 h-10" strokeWidth={3} />
            <span data-testid="reward-amount">+{info.reward}</span>
          </div>
          <p className="text-xs text-slate-700 font-bold">
            Come back tomorrow to bump your streak — bigger rewards every day.
          </p>
          <TactileButton
            color="#FB923C"
            size="lg"
            onClick={claim}
            disabled={busy}
            className="w-full"
            data-testid="claim-reward-button"
          >
            {busy ? "Claiming…" : "Claim Reward"}
          </TactileButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
