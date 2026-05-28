import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

const client = axios.create({ baseURL: API });

export const getLevels = () => client.get("/levels").then((r) => r.data);
export const getPuzzles = (level, difficulty) =>
  client.get(`/puzzles/${level}`, { params: { difficulty } }).then((r) => r.data);
export const submitAnswer = (payload) =>
  client.post("/answer", payload).then((r) => r.data);
export const getHint = (puzzleId) =>
  client.get(`/hint/${puzzleId}`).then((r) => r.data);
export const getPlayer = (playerId) =>
  client.get(`/player/${playerId}`).then((r) => r.data);
export const savePlayer = (payload) =>
  client.post("/player", payload).then((r) => r.data);
export const updateProgress = (payload) =>
  client.post("/progress", payload).then((r) => r.data);
export const getShopPacks = () => client.get("/shop/packs").then((r) => r.data);
export const purchasePack = (payload) =>
  client.post("/shop/purchase", payload).then((r) => r.data);
export const generateAiRiddle = (payload) =>
  client.post("/ai/riddle", payload).then((r) => r.data);
export const getDailyChallenge = () =>
  client.get("/daily-challenge").then((r) => r.data);

export const getHomestead = (playerId) =>
  client.get(`/homestead/${playerId}`).then((r) => r.data);
export const plantCrop = (payload) =>
  client.post("/homestead/plant", payload).then((r) => r.data);
export const harvestCrop = (payload) =>
  client.post("/homestead/harvest", payload).then((r) => r.data);
export const boostCrop = (payload) =>
  client.post("/homestead/boost", payload).then((r) => r.data);
export const expandHomestead = (payload) =>
  client.post("/homestead/expand", payload).then((r) => r.data);

export const getDefense = (playerId) =>
  client.get(`/defense/${playerId}`).then((r) => r.data);
export const upgradeWall = (payload) =>
  client.post("/defense/upgrade", payload).then((r) => r.data);
export const startRaid = (playerId) =>
  client.get(`/defense/raid/start`, { params: { player_id: playerId } }).then((r) => r.data);
export const resolveRaid = (payload) =>
  client.post("/defense/raid/resolve", payload).then((r) => r.data);

export const getShareCard = (playerId) =>
  client.get(`/share-card/${playerId}`).then((r) => r.data);

export const getMyFriendCode = (playerId) =>
  client.get(`/friend-code/${playerId}`).then((r) => r.data);
export const lookupFriend = (code) =>
  client.get(`/friend/lookup/${code}`).then((r) => r.data);
export const addFriend = (payload) =>
  client.post("/friend/add", payload).then((r) => r.data);
export const removeFriend = (playerId, friendPlayerId) =>
  client.delete(`/friend/${playerId}/${friendPlayerId}`).then((r) => r.data);
export const listFriends = (playerId) =>
  client.get(`/friends/${playerId}`).then((r) => r.data);
export const submitDuelScore = (payload) =>
  client.post("/duel/submit", payload).then((r) => r.data);
export const getDuelScores = (playerId) =>
  client.get(`/duel/scores/${playerId}`).then((r) => r.data);

export const getExpeditionSeason = () =>
  client.get("/expedition/season").then((r) => r.data);
export const getExpedition = (playerId) =>
  client.get(`/expedition/${playerId}`).then((r) => r.data);
export const startExpeditionToday = (playerId) =>
  client.get("/expedition/today/start", { params: { player_id: playerId } }).then((r) => r.data);
export const resolveExpeditionToday = (payload) =>
  client.post("/expedition/today/resolve", payload).then((r) => r.data);
export const claimExpeditionTier = (payload) =>
  client.post("/expedition/claim", payload).then((r) => r.data);
export const activateFrame = (payload) =>
  client.post("/expedition/frame", payload).then((r) => r.data);

export default client;
