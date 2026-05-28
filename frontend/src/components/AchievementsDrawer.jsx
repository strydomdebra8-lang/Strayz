import { useEffect, useState } from "react";
import * as Lucide from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { ACHIEVEMENTS, getEarned } from "@/lib/achievements";

export default function AchievementsDrawer({ open, onOpenChange }) {
  const [earned, setEarned] = useState([]);
  useEffect(() => {
    if (open) setEarned(getEarned());
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-amber-50 border-l-4 border-slate-800 p-0"
        data-testid="achievements-drawer"
      >
        <div className="px-6 py-4 border-b-4 border-slate-800 bg-gradient-to-r from-amber-300 to-pink-300">
          <SheetHeader className="flex flex-row items-center justify-between">
            <div>
              <SheetTitle className="font-display text-2xl text-slate-900">
                Achievements
              </SheetTitle>
              <SheetDescription className="text-slate-800">
                {earned.length} of {ACHIEVEMENTS.length} unlocked
              </SheetDescription>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="tactile-btn bg-white text-slate-800 px-2 py-2"
              data-testid="achievements-close-button"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </SheetHeader>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-100px)]">
          {ACHIEVEMENTS.map((a) => {
            const Icon = Lucide[a.icon] || Lucide.Award;
            const got = earned.includes(a.id);
            return (
              <div
                key={a.id}
                className={`tactile-card p-4 flex gap-3 items-center transition ${
                  got ? "bg-white" : "bg-slate-100 opacity-70"
                }`}
                data-testid={`achievement-${a.id}`}
              >
                <div
                  className="w-12 h-12 rounded-2xl border-2 border-slate-800 flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: got ? a.color : "#CBD5E1" }}
                >
                  <Icon
                    className="w-6 h-6 text-white"
                    strokeWidth={3}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-slate-900">
                    {a.name}
                  </p>
                  <p className="text-xs text-slate-700 leading-tight">{a.desc}</p>
                </div>
                {got && (
                  <span className="font-accent text-xs px-2 py-1 rounded-full bg-emerald-200 border-2 border-emerald-700 text-emerald-900">
                    UNLOCKED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
