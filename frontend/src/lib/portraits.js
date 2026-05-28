// Custom portrait override stored in localStorage as data URL.
const PREFIX = "strayz_portrait_";

export function getPortraitOverride(characterId) {
  return localStorage.getItem(PREFIX + characterId) || null;
}

export function setPortraitOverride(characterId, dataUrl) {
  if (dataUrl) localStorage.setItem(PREFIX + characterId, dataUrl);
  else localStorage.removeItem(PREFIX + characterId);
}

// Resolve a character's image (override > default)
export function resolveCharacterImage(character) {
  if (!character) return "";
  return getPortraitOverride(character.id) || character.image;
}
