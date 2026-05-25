// Lightweight game state stored in localStorage with backend sync.
const KEY = "strayz_player_id";
const NAME_KEY = "strayz_player_name";
const CHAR_KEY = "strayz_character";
const DIFF_KEY = "strayz_difficulty";
const SOUND_KEY = "strayz_sound";

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
  return localStorage.getItem(CHAR_KEY) || "max";
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

export function resetGame() {
  [KEY, NAME_KEY, CHAR_KEY, DIFF_KEY, SOUND_KEY].forEach((k) =>
    localStorage.removeItem(k)
  );
}
