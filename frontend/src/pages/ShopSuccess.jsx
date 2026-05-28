import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Coins, Gem, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import TactileButton from "@/components/TactileButton";
import { getCheckoutStatus } from "@/lib/api";
import { sfx } from "@/lib/sound";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 8;

export default function ShopSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setError("Missing session id");
      return;
    }
    let cancelled = false;
    let attemptCount = 0;

    const poll = async () => {
      if (cancelled) return;
      try {
        const data = await getCheckoutStatus(sessionId);
        if (cancelled) return;
        setStatus(data);
        setAttempts(attemptCount);

        if (data.payment_status === "paid") {
          if (!celebratedRef.current) {
            celebratedRef.current = true;
            sfx.coin();
            toast.success(`+${data.coins} coins, +${data.gems} gems credited!`);
          }
          return;
        }
        if (data.status === "expired") {
          setError("Checkout session expired. Please try again.");
          return;
        }
        attemptCount += 1;
        if (attemptCount >= MAX_ATTEMPTS) {
          setError(
            "Still processing — your purchase will be credited automatically. Check back in a few minutes."
          );
          return;
        }
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (e) {
        if (cancelled) return;
        setError(e?.response?.data?.detail || "Could not verify payment");
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const paid = status?.payment_status === "paid";
  const pending =
    !error && (!status || (status.payment_status !== "paid" && status.status !== "expired"));

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(74,222,128,0.4), transparent 60%), radial-gradient(circle at 80% 100%, rgba(251,191,36,0.4), transparent 55%), linear-gradient(180deg, #FEFCE8 0%, #FDE68A 100%)",
      }}
      data-testid="shop-success-page"
    >
      <div className="tactile-card bg-white max-w-md w-full p-8 text-center">
        {pending && (
          <>
            <Loader2 className="w-16 h-16 mx-auto text-amber-500 animate-spin" strokeWidth={3} />
            <h1 className="font-display font-bold text-3xl text-slate-900 mt-3">
              Confirming your purchase…
            </h1>
            <p className="text-slate-600 mt-2 text-sm">
              We&apos;re double-checking with Stripe. This usually takes 1-2 seconds.
            </p>
            <p className="text-xs font-mono text-slate-400 mt-3">
              attempt {attempts + 1} / {MAX_ATTEMPTS}
            </p>
          </>
        )}

        {paid && (
          <>
            <CheckCircle2
              className="w-16 h-16 mx-auto text-emerald-500"
              strokeWidth={3}
              data-testid="success-icon"
            />
            <h1 className="font-display font-bold text-3xl text-slate-900 mt-3">
              Payment successful!
            </h1>
            <p className="text-slate-700 mt-2">
              Thank you for supporting Strayz. Your <strong>{status.pack_name}</strong> is ready.
            </p>
            <div className="mt-5 inline-flex items-center gap-4 px-5 py-3 rounded-2xl border-4 border-emerald-700 bg-emerald-100">
              {status.coins > 0 && (
                <span className="inline-flex items-center gap-1 font-display font-bold text-amber-700 text-2xl">
                  <Coins className="w-5 h-5" strokeWidth={3} /> +{status.coins}
                </span>
              )}
              {status.gems > 0 && (
                <span className="inline-flex items-center gap-1 font-display font-bold text-violet-700 text-2xl">
                  <Gem className="w-5 h-5" strokeWidth={3} /> +{status.gems}
                </span>
              )}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              New balance: <strong>{status.player_coins} coins</strong> ·{" "}
              <strong>{status.player_gems} gems</strong>
            </p>
          </>
        )}

        {error && (
          <>
            <XCircle className="w-16 h-16 mx-auto text-rose-500" strokeWidth={3} />
            <h1 className="font-display font-bold text-3xl text-slate-900 mt-3">
              Something went wrong
            </h1>
            <p className="text-slate-700 mt-2">{error}</p>
          </>
        )}

        <div className="mt-6 flex flex-col gap-3 items-center">
          <TactileButton
            color="#38BDF8"
            size="md"
            onClick={() => navigate("/")}
            data-testid="back-to-menu-button"
          >
            Back to Menu
          </TactileButton>
          <p className="text-xs text-slate-500 inline-flex items-center gap-1">
            <Lock className="w-3 h-3" strokeWidth={3} />
            Powered by Stripe — test mode
          </p>
        </div>
      </div>
    </div>
  );
}
