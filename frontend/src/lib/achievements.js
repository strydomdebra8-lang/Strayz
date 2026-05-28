// Achievements catalog + earn-checking logic. Persisted in localStorage.
const KEY = "strayz_achievements";

export const ACHIEVEMENTS = [
  {
    id: "first-win",
    name: "First Steps",
    desc: "Answer your very first puzzle correctly.",
    icon: "Sparkles",
    color: "#4ADE80",
  },
  {
    id: "level-1-clear",
    name: "Jungle Tamer",
    desc: "Complete Level 1: Jungle Ruins.",
    icon: "TreePine",
    color: "#16A34A",
  },
  {
    id: "level-6-clear",
    name: "Arena Champion",
    desc: "Complete Level 6: Sports Arena.",
    icon: "Trophy",
    color: "#22D3EE",
  },
  {
    id: "all-levels",
    name: "World Liberator",
    desc: "Complete all 6 levels.",
    icon: "Crown",
    color: "#FB923C",
  },
  {
    id: "coin-collector",
    name: "Coin Collector",
    desc: "Accumulate 500 coins.",
    icon: "Coins",
    color: "#FBBF24",
  },
  {
    id: "endless-streak-5",
    name: "Brainstormer",
    desc: "Hit a 5-streak in Endless AI mode.",
    icon: "Brain",
    color: "#A78BFA",
  },
  {
    id: "daily-perfect",
    name: "Family Champion",
    desc: "Solve the entire Daily Challenge (6/6).",
    icon: "CalendarCheck",
    color: "#F472B6",
  },
  {
    id: "custom-portrait",
    name: "True Identity",
    desc: "Customise your character portrait.",
    icon: "Image",
    color: "#38BDF8",
  },
  {
    id: "first-harvest",
    name: "Green Thumb",
    desc: "Harvest your first crop at the Homestead.",
    icon: "Sprout",
    color: "#4ADE80",
  },
  {
    id: "homestead-expanded",
    name: "Land Baron",
    desc: "Expand the Homestead with extra plots.",
    icon: "Home",
    color: "#FB923C",
  },
  {
    id: "homestead-level-3",
    name: "Master Farmer",
    desc: "Reach Homestead level 3.",
    icon: "Award",
    color: "#A78BFA",
  },
  {
    id: "first-raid-win",
    name: "Castle Defender",
    desc: "Survive your first raid at the Defense Tower.",
    icon: "Shield",
    color: "#EF4444",
  },
  {
    id: "wall-fortress",
    name: "Fortress Keeper",
    desc: "Upgrade your wall to Level 3 or higher.",
    icon: "Castle",
    color: "#7C3AED",
  },
  {
    id: "first-friend",
    name: "Buddy System",
    desc: "Add your first friend by friend code.",
    icon: "UserPlus",
    color: "#6366F1",
  },
  {
    id: "crew-of-three",
    name: "Crew of Three",
    desc: "Build a crew of 3 or more friends.",
    icon: "Users",
    color: "#0EA5E9",
  },
];

export function getEarned() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function isEarned(id) {
  return getEarned().includes(id);
}

export function earn(id) {
  const set = new Set(getEarned());
  if (set.has(id)) return false;
  set.add(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(set)));
  return true;
}
