import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import TactileButton from "@/components/TactileButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isStandalone, isIOS } from "@/lib/pwa";

const DISMISS_KEY = "strayz_install_dismissed";
const DISMISS_DAYS = 7;

function recentlyDismissed() {
  try {
    const ts = parseInt(localStorage.getItem(DISMISS_KEY) || "0", 10);
    if (!ts) return false;
    const ageMs = Date.now() - ts;
    return ageMs < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function dismissNow() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {}
}

/**
 * Floating install button + iOS instruction dialog.
 * - On Chrome/Edge/Android: capture beforeinstallprompt, show button when available.
 * - On iOS Safari (no event): show a one-time hint dialog after a delay.
 * - Hides automatically once installed (display-mode: standalone).
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [iosHintOpen, setIosHintOpen] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }
    if (recentlyDismissed()) return;

    const onBefore = (e) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
    };
    window.addEventListener("beforeinstallprompt", onBefore);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari never fires beforeinstallprompt — surface manual hint after a beat.
    let iosTimer = null;
    if (isIOS()) {
      iosTimer = setTimeout(() => setVisible(true), 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  if (installed || !visible) return null;

  const handleClick = async () => {
    if (deferred) {
      deferred.prompt();
      try {
        await deferred.userChoice;
      } catch {}
      setDeferred(null);
      setVisible(false);
    } else if (isIOS()) {
      setIosHintOpen(true);
    }
  };

  const handleDismiss = () => {
    dismissNow();
    setVisible(false);
  };

  return (
    <>
      <div
        className="fixed left-4 bottom-4 sm:left-6 sm:bottom-6 z-40 flex items-center gap-2"
        data-testid="install-prompt"
      >
        <TactileButton
          color="#10B981"
          size="md"
          icon={Smartphone}
          onClick={handleClick}
          data-testid="install-app-button"
        >
          Install Strayz
        </TactileButton>
        <button
          onClick={handleDismiss}
          className="w-9 h-9 rounded-full border-2 border-slate-800 bg-white hover:bg-slate-100 flex items-center justify-center"
          aria-label="Dismiss install prompt"
          data-testid="dismiss-install-button"
        >
          <X className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>

      <Dialog open={iosHintOpen} onOpenChange={setIosHintOpen}>
        <DialogContent className="bg-white border-4 border-slate-800 rounded-3xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-emerald-600" strokeWidth={3} />
              Install Strayz on your iPhone / iPad
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Add Strayz to your home screen so it launches like a native app.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm font-semibold text-slate-800 list-decimal pl-6">
            <li>
              Tap the <strong>Share</strong> button{" "}
              <Share className="inline w-4 h-4 align-text-bottom" strokeWidth={3} /> at the
              bottom of Safari.
            </li>
            <li>
              Scroll down and tap{" "}
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
                <Download className="inline w-3 h-3 mr-1" strokeWidth={3} />
                Add to Home Screen
              </span>
              .
            </li>
            <li>
              Tap <strong>Add</strong> — Strayz will appear on your home screen.
            </li>
          </ol>
          <div className="mt-3 text-right">
            <TactileButton
              color="#38BDF8"
              size="md"
              onClick={() => {
                dismissNow();
                setIosHintOpen(false);
                setVisible(false);
              }}
              data-testid="ios-hint-got-it"
            >
              Got it
            </TactileButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
