// Lightweight game state stored in localStorage with backend sync.
const KEY = "strayz_player_id";
const NAME_KEY = "strayz_player_name";
const CHAR_KEY = "strayz_character";
const PARTNER_KEY = "strayz_partner";
const DIFF_KEY = "strayz_difficulty";
const SOUND_KEY = "strayz_sound";
const REDUCE_MOTION_KEY = "strayz_reduce_motion";
const LARGE_TEXT_KEY = "strayz_large_text";

export function getPlayerId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `player-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function getPlayerName() {
  return localStorage.getItem(NAME_KEY) || "Adventurer";
}
export function setPlayerName(name) {
  localStorage.setItem(NAME_KEY, name);
}

export function getCharacter() {
  return localStorage.getItem(CHAR_KEY) || "chris";
}
export function setCharacter(c) {
  localStorage.setItem(CHAR_KEY, c);
}

export function getDifficulty() {
  return localStorage.getItem(DIFF_KEY) || "medium";
}
export function setDifficulty(d) {
  localStorage.setItem(DIFF_KEY, d);
}

export function getSoundEnabled() {
  return localStorage.getItem(SOUND_KEY) !== "off";
}
export function setSoundEnabled(b) {
  localStorage.setItem(SOUND_KEY, b ? "on" : "off");
}

export function getPartner() {
  return localStorage.getItem(PARTNER_KEY) || "";
}
export function setPartner(id) {
  if (id) localStorage.setItem(PARTNER_KEY, id);
  else localStorage.removeItem(PARTNER_KEY);
}

export function getReduceMotion() {
  return localStorage.getItem(REDUCE_MOTION_KEY) === "on";
}
export function setReduceMotion(b) {
  localStorage.setItem(REDUCE_MOTION_KEY, b ? "on" : "off");
}

export function getLargeText() {
  return localStorage.getItem(LARGE_TEXT_KEY) === "on";
}
export function setLargeText(b) {
  localStorage.setItem(LARGE_TEXT_KEY, b ? "on" : "off");
}

export function applyAccessibility() {
  const root = document.documentElement;
  if (getReduceMotion()) root.classList.add("reduce-motion");
  else root.classList.remove("reduce-motion");
  if (getLargeText()) root.classList.add("large-text");
  else root.classList.remove("large-text");
}

export function resetGame() {
  [KEY, NAME_KEY, CHAR_KEY, DIFF_KEY, SOUND_KEY].forEach((k) =>
    localStorage.removeItem(k)
  );
}
