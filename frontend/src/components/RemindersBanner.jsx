import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Compass, CalendarCheck, Trophy, X } from "lucide-react";
import { getDuelScores, getExpedition } from "@/lib/api";
import { getPlayerId } from "@/lib/gameStore";

const DISMISS_KEY = "strayz_reminders_dismissed_today";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dismissedToday(slug) {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) || "{}");
    return raw.date === todayKey() && raw.slugs?.includes(slug);
  } catch {
    return false;
  }
}

function dismiss(slug) {
  try {
    const raw = JSON.parse(localStorage.getItem(DISMISS_KEY) || "{}");
    const slugs = raw.date === todayKey() ? raw.slugs || [] : [];
    if (!slugs.includes(slug)) slugs.push(slug);
    localStorage.setItem(
      DISMISS_KEY,
      JSON.stringify({ date: todayKey(), slugs })
    );
  } catch {}
}

/**
 * Smart banner shown on MainMenu when there's something timely to do.
 * Priority order:
 *  1. Friend has beaten the player's duel score today (and player hasn't surpassed)
 *  2. Daily Expedition not completed yet
 *  3. Daily Duel not played yet
 */
export default function RemindersBanner() {
  const navigate = useNavigate();
  const [reminder, setReminder] = useState(null);
  const playerId = getPlayerId();

  useEffect(() => {
    let cancelled = false;
    async function compute() {
      try {
        const [duel, exp] = await Promise.all([
          getDuelScores(playerId).catch(() => null),
          getExpedition(playerId).catch(() => null),
        ]);
        if (cancelled) return;

        // (1) Friend beat your score
        if (duel?.rows?.length) {
          const me = duel.rows.find((r) => r.is_me);
          const topFriend = duel.rows.find((r) => !r.is_me && r.played);
          if (me && topFriend && topFriend.score > (me.score || 0)) {
            const slug = `friend-beat-${duel.date}`;
            if (!dismissedToday(slug)) {
              setReminder({
                slug,
                icon: Trophy,
                color: "#EF4444",
                title: `${topFriend.name} beat your Daily Duel!`,
                body: `${topFriend.score}/${topFriend.total} vs your ${me.score || 0}. Run it back?`,
                cta: "Play Daily",
                to: "/daily",
              });
              return;
            }
          }
        }

        // (2) Expedition not done
        if (exp?.expedition && !exp.expedition.completed_today) {
          const slug = `expedition-${exp.expedition.season_key}-${todayKey()}`;
          if (!dismissedToday(slug)) {
            setReminder({
              slug,
              icon: Compass,
              color: "#7C3AED",
              title: `${exp.expedition.theme.name} expedition awaits`,
              body: `3 themed puzzles, earn season XP. Ends in ${Math.ceil(
                exp.expedition.ends_in_seconds / 86400
              )} days.`,
              cta: "Begin",
              to: "/expedition",
            });
            return;
          }
        }

        // (3) Daily not played
        if (duel?.rows?.length) {
          const me = duel.rows.find((r) => r.is_me);
          if (me && !me.played) {
            const slug = `daily-${duel.date}`;
            if (!dismissedToday(slug)) {
              setReminder({
                slug,
                icon: CalendarCheck,
                color: "#22D3EE",
                title: "Daily Duel not played yet",
                body: "Log a score before midnight to keep your streak alive.",
                cta: "Play Daily",
                to: "/daily",
              });
              return;
            }
          }
        }

        setReminder(null);
      } catch {
        setReminder(null);
      }
    }
    compute();
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (!reminder) return null;
  const Icon = reminder.icon;

  return (
    <div
      className="max-w-3xl mx-auto mt-4 px-4"
      data-testid="reminders-banner"
    >
      <div
        className="tactile-card flex items-center gap-3 p-3 sm:p-4 relative"
        style={{ backgroundColor: reminder.color + "15", borderColor: reminder.color }}
      >
        <div
          className="flex-shrink-0 w-12 h-12 rounded-2xl border-2 border-slate-900 flex items-center justify-center"
          style={{ backgroundColor: reminder.color }}
        >
          <Icon className="w-6 h-6 text-white" strokeWidth={3} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-display font-bold text-slate-900 text-sm sm:text-base"
            data-testid="reminder-title"
          >
            {reminder.title}
          </p>
          <p className="text-xs sm:text-sm text-slate-700 truncate">
            {reminder.body}
          </p>
        </div>
        <button
          onClick={() => navigate(reminder.to)}
          className="hidden sm:inline-flex px-3 py-2 rounded-full font-display font-bold text-white text-sm border-2 border-slate-900 active:translate-y-0.5"
          style={{
            backgroundColor: reminder.color,
            boxShadow: "0 4px 0 0 #1E293B",
          }}
          data-testid="reminder-cta"
        >
          {reminder.cta}
        </button>
        <button
          onClick={() => navigate(reminder.to)}
          className="sm:hidden px-3 py-1.5 rounded-full font-bold text-white text-xs border-2 border-slate-900"
          style={{ backgroundColor: reminder.color }}
          data-testid="reminder-cta-mobile"
        >
          Go
        </button>
        <button
          onClick={() => {
            dismiss(reminder.slug);
            setReminder(null);
          }}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 border-slate-800 flex items-center justify-center hover:bg-slate-100"
          aria-label="Dismiss reminder"
          data-testid="reminder-dismiss"
        >
          <X className="w-3 h-3" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
