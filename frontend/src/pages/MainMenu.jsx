import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, BookOpenText, Sparkles, Map, Settings, Brain } from "lucide-react";
import TactileButton from "@/components/TactileButton";
import ShopDrawer from "@/components/ShopDrawer";
import GameNav from "@/components/GameNav";
import { BACKGROUNDS, CHARACTERS } from "@/data/storyData";
import {
  getPlayerId,
  getCharacter,
  setCharacter as saveCharacter,
  getDifficulty,
  setDifficulty as saveDifficulty,
  getPlayerName,
  setPlayerName as savePlayerName,
} from "@/lib/gameStore";
import { getPlayer, savePlayer } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DIFFICULTIES = [
  { id: "easy", label: "Cub Scout", color: "#4ADE80", note: "Relaxed" },
  { id: "medium", label: "Explorer", color: "#FB923C", note: "Balanced" },
  { id: "hard", label: "Legend", color: "#F472B6", note: "Brain Burner" },
];

export default function MainMenu() {
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [shopOpen, setShopOpen] = useState(false);
  const [char, setChar] = useState(getCharacter());
  const [diff, setDiff] = useState(getDifficulty());
  const [name, setName] = useState(getPlayerName());

  useEffect(() => {
    const pid = getPlayerId();
    getPlayer(pid).then(setPlayer).catch(() => {});
  }, []);

  const pickCharacter = (id) => {
    setChar(id);
    saveCharacter(id);
    if (player) {
      const updated = { ...player, selected_character: id };
      savePlayer(updated).then(setPlayer).catch(() => {});
    }
  };
  const pickDifficulty = (id) => {
    setDiff(id);
    saveDifficulty(id);
  };
  const saveName = () => {
    savePlayerName(name);
    if (player) {
      const updated = { ...player, name };
      savePlayer(updated).then(setPlayer).catch(() => {});
    }
  };

  const selectedChar = CHARACTERS.find((c) => c.id === char) || CHARACTERS[0];

  return (
    <div
      className="min-h-screen bg-amber-100"
      style={{
        backgroundImage: `linear-gradient(rgba(254,243,199,0.7), rgba(254,243,199,0.92)), url(${BACKGROUNDS.main})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      data-testid="main-menu-page"
    >
      <GameNav player={player} onOpenShop={() => setShopOpen(true)} hideHome />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <section className="text-center animate-pop-in">
          <span className="font-accent text-sky-700 text-lg sm:text-xl block mb-2">
            EDUCATIONAL ADVENTURE
          </span>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-slate-900 text-shadow-pop">
            STRAYZ
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-slate-800 text-base sm:text-lg font-semibold">
            A point-and-click family quest. Solve brain teasers, music trivia &amp;
            world riddles to recover stolen artifacts across five vibrant lands.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TactileButton
              color="#38BDF8"
              size="xl"
              icon={Play}
              onClick={() => navigate("/story")}
              data-testid="start-game-button"
            >
              Start Adventure
            </TactileButton>
            <TactileButton
              color="#FBBF24"
              textColor="#1E293B"
              size="xl"
              icon={Map}
              onClick={() => navigate("/map")}
              data-testid="open-map-button"
            >
              World Map
            </TactileButton>
            <TactileButton
              color="#A78BFA"
              size="xl"
              icon={Brain}
              onClick={() => navigate("/endless")}
              data-testid="open-endless-button"
            >
              Endless AI
            </TactileButton>
          </div>
        </section>

        {/* Character + Settings Bento */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Character pick */}
          <div className="lg:col-span-2 tactile-card p-6 sm:p-8" data-testid="character-picker">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-display font-bold text-2xl text-slate-900">
                Choose Your Stray
              </h2>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="tactile-btn bg-white text-slate-800 px-3 py-2 text-sm"
                    data-testid="open-name-dialog"
                  >
                    <Settings className="w-4 h-4 inline mr-1" strokeWidth={3} />
                    {name}
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-amber-50 border-4 border-slate-800 rounded-3xl">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">
                      Player Name
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Label htmlFor="name-input" className="font-bold">
                      What should we call you?
                    </Label>
                    <Input
                      id="name-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-2 border-slate-800 rounded-xl"
                      data-testid="player-name-input"
                    />
                    <TactileButton
                      color="#4ADE80"
                      onClick={saveName}
                      className="w-full"
                      data-testid="save-name-button"
                    >
                      Save
                    </TactileButton>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHARACTERS.map((c) => {
                const active = c.id === char;
                return (
                  <button
                    key={c.id}
                    onClick={() => pickCharacter(c.id)}
                    className={`rounded-2xl border-4 p-3 text-left transition-all duration-200 ${
                      active
                        ? "border-slate-900 tactile-shadow"
                        : "border-slate-300 hover:border-slate-600"
                    }`}
                    style={{
                      backgroundColor: active ? c.color + "30" : "#FFFFFF",
                    }}
                    data-testid={`character-card-${c.id}`}
                  >
                    <div
                      className="w-full h-24 rounded-xl border-2 border-slate-800 overflow-hidden"
                      style={{ backgroundColor: c.color + "40" }}
                    >
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="mt-2 font-display font-bold text-base text-slate-900">
                      {c.name}{" "}
                      <span className="text-xs text-slate-600 font-normal">
                        ({c.age})
                      </span>
                    </p>
                    <p className="text-xs text-slate-700">{c.role}</p>
                  </button>
                );
              })}
            </div>

            <div
              className="mt-5 p-4 rounded-2xl border-2 border-slate-800 bg-white flex items-start gap-3"
              data-testid="character-bio"
            >
              <Sparkles
                className="w-5 h-5 mt-0.5 text-amber-500"
                strokeWidth={3}
              />
              <p className="text-sm text-slate-700">
                <strong>{selectedChar.name}</strong> — {selectedChar.bio}
              </p>
            </div>
          </div>

          {/* Difficulty */}
          <div className="tactile-card p-6 sm:p-8" data-testid="difficulty-picker">
            <h2 className="font-display font-bold text-2xl text-slate-900">
              Difficulty
            </h2>
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mt-1">
              Tap to change
            </p>
            <div className="mt-4 space-y-3">
              {DIFFICULTIES.map((d) => {
                const active = d.id === diff;
                return (
                  <button
                    key={d.id}
                    onClick={() => pickDifficulty(d.id)}
                    className={`w-full text-left rounded-2xl border-4 p-3 transition-all ${
                      active
                        ? "border-slate-900 tactile-shadow"
                        : "border-slate-300 hover:border-slate-600"
                    }`}
                    style={{
                      backgroundColor: active ? d.color : "#FFFFFF",
                      color: active ? "#1E293B" : "#1E3A8A",
                    }}
                    data-testid={`difficulty-${d.id}`}
                  >
                    <div className="font-display font-bold text-lg">{d.label}</div>
                    <div className="text-xs font-bold uppercase tracking-wider opacity-80">
                      {d.note}
                    </div>
                  </button>
                );
              })}
            </div>

            <TactileButton
              color="#FB923C"
              size="md"
              icon={BookOpenText}
              onClick={() => navigate("/story")}
              className="w-full mt-5"
              data-testid="play-story-button"
            >
              Read the Story
            </TactileButton>
          </div>
        </section>
      </main>

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={setPlayer}
      />
    </div>
  );
}
