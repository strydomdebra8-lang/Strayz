import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, X, Settings as SettingsIcon } from "lucide-react";
import TactileButton from "@/components/TactileButton";
import { CHARACTERS } from "@/data/storyData";
import {
  getReduceMotion,
  setReduceMotion,
  getLargeText,
  setLargeText,
  applyAccessibility,
  getPartner,
  setPartner,
  getCharacter,
} from "@/lib/gameStore";

export default function SettingsDrawer({ open, onOpenChange }) {
  const [reduce, setReduce] = useState(getReduceMotion());
  const [large, setLarge] = useState(getLargeText());
  const [partner, setLocalPartner] = useState(getPartner());

  useEffect(() => {
    applyAccessibility();
  }, [reduce, large]);

  const toggleReduce = (v) => {
    setReduceMotion(v);
    setReduce(v);
    applyAccessibility();
  };
  const toggleLarge = (v) => {
    setLargeText(v);
    setLarge(v);
    applyAccessibility();
  };
  const pickPartner = (id) => {
    if (id === getCharacter()) return;
    const next = partner === id ? "" : id;
    setPartner(next);
    setLocalPartner(next);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-amber-50 border-l-4 border-slate-800 p-0"
        data-testid="settings-drawer"
      >
        <div className="px-6 py-4 border-b-4 border-slate-800 bg-gradient-to-r from-sky-300 to-violet-300">
          <SheetHeader className="flex flex-row items-center justify-between">
            <div>
              <SheetTitle className="font-display text-2xl text-slate-900 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6" strokeWidth={3} /> Settings
              </SheetTitle>
              <SheetDescription className="text-slate-800">
                Accessibility &amp; Co-op options
              </SheetDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="tactile-btn bg-white text-slate-800 px-2 py-2"
              data-testid="settings-close-button"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Accessibility */}
          <section
            className="tactile-card bg-white p-4 space-y-4"
            data-testid="accessibility-section"
          >
            <h3 className="font-display font-bold text-lg text-slate-900">
              Accessibility
            </h3>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="reduce-motion" className="flex-1 font-semibold text-slate-800">
                Reduce motion
                <span className="block text-xs text-slate-500 font-normal">
                  Disable bouncing & walk animations
                </span>
              </Label>
              <Switch
                id="reduce-motion"
                checked={reduce}
                onCheckedChange={toggleReduce}
                data-testid="toggle-reduce-motion"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="large-text" className="flex-1 font-semibold text-slate-800">
                Large text
                <span className="block text-xs text-slate-500 font-normal">
                  Easier-to-read font size
                </span>
              </Label>
              <Switch
                id="large-text"
                checked={large}
                onCheckedChange={toggleLarge}
                data-testid="toggle-large-text"
              />
            </div>
          </section>

          {/* Co-op Pass & Play */}
          <section
            className="tactile-card bg-white p-4"
            data-testid="coop-section"
          >
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5" strokeWidth={3} />
              Co-op Pass &amp; Play
            </h3>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Pair up a partner. Their specialty &amp; coach bonuses stack with yours.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {CHARACTERS.map((c) => {
                const isCurrent = c.id === getCharacter();
                const active = c.id === partner;
                return (
                  <button
                    key={c.id}
                    onClick={() => pickPartner(c.id)}
                    disabled={isCurrent}
                    className={`rounded-xl border-2 p-2 text-left transition ${
                      active
                        ? "border-slate-900 tactile-shadow-sm bg-amber-100"
                        : "border-slate-300 bg-white hover:border-slate-600"
                    } ${isCurrent ? "opacity-40 cursor-not-allowed" : ""}`}
                    data-testid={`partner-pick-${c.id}`}
                  >
                    <div
                      className="w-full h-16 rounded-md border border-slate-800 overflow-hidden"
                      style={{ backgroundColor: c.color + "40" }}
                    >
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-1 font-bold text-xs text-slate-900 truncate">
                      {c.name}
                    </p>
                  </button>
                );
              })}
            </div>
            {partner && (
              <TactileButton
                color="#FFFFFF"
                textColor="#1E293B"
                size="sm"
                onClick={() => pickPartner(partner)}
                className="w-full mt-3"
                data-testid="clear-partner-button"
              >
                Solo mode
              </TactileButton>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
