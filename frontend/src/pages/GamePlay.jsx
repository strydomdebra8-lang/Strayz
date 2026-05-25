import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Lightbulb,
  ArrowRight,
  Trophy,
  Check,
  X,
  Star,
  Map as MapIcon,
} from "lucide-react";
import GameNav from "@/components/GameNav";
import ShopDrawer from "@/components/ShopDrawer";
import TactileButton from "@/components/TactileButton";
import TriviaPuzzle from "@/components/TriviaPuzzle";
import PatternPuzzle from "@/components/PatternPuzzle";
import CharacterCompanion from "@/components/CharacterCompanion";
import HotspotScene from "@/components/HotspotScene";
import { sfx, playMusic } from "@/lib/sound";
import {
  BACKGROUNDS,
  LEVEL_INTROS,
  CHARACTER_SPECIALTY_LEVEL,
  CHARACTER_FLAT_BONUS,
  getCharacterLine,
} from "@/data/storyData";
import {
  getPuzzles,
  getLevels,
  submitAnswer,
  getHint,
  getPlayer,
  updateProgress,
} from "@/lib/api";
import {
  getPlayerId,
  getDifficulty,
  getCharacter,
  setCharacter as saveCharacter,
} from "@/lib/gameStore";

export default function GamePlay() {
  const { levelId } = useParams();
  const levelNum = parseInt(levelId, 10);
  const navigate = useNavigate();

  const [levels, setLevels] = useState([]);
  const [player, setPlayer] = useState(null);
  const [puzzles, setPuzzles] = useState([]);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [hintShown, setHintShown] = useState(null);
  const [score, setScore] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [introOpen, setIntroOpen] = useState(true);
  const [characterId, setCharacterId] = useState(getCharacter());
  const [companionMood, setCompanionMood] = useState("idle");
  const [companionSpeech, setCompanionSpeech] = useState("");
  const [freeHintAvailable, setFreeHintAvailable] = useState(false);
  const [specialtyBonusGranted, setSpecialtyBonusGranted] = useState(false);
  const [showScene, setShowScene] = useState(true);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const difficulty = getDifficulty();

  const isSpecialty = CHARACTER_SPECIALTY_LEVEL[characterId] === levelNum;

  const level = useMemo(
    () => levels.find((l) => l.id === levelNum),
    [levels, levelNum]
  );

  useEffect(() => {
    Promise.all([
      getLevels().then((d) => setLevels(d.levels)),
      getPuzzles(levelNum, difficulty).then((d) => setPuzzles(d.puzzles)),
      getPlayer(getPlayerId()).then(setPlayer),
    ])
      .catch(() => toast.error("Failed to load level."))
      .finally(() => setLoading(false));
  }, [levelNum, difficulty]);

  const current = puzzles[idx];
  const totalPuzzles = puzzles.length;
  const completedAll = idx >= totalPuzzles && totalPuzzles > 0;

  const handleSubmit = async (selectedValue) => {
    if (!current || feedback) return;
    try {
      const result = await submitAnswer({
        puzzle_id: current.id,
        selected: selectedValue,
        difficulty,
      });

      // Apply specialty bonus (once per level) + flat per-correct bonus (e.g. Arthur)
      let bonusCoins = 0;
      let bonusLabel = "";
      if (result.correct && isSpecialty && !specialtyBonusGranted) {
        bonusCoins += 10;
        setSpecialtyBonusGranted(true);
        bonusLabel = `${characterId.charAt(0).toUpperCase() + characterId.slice(1)}'s specialty +10`;
      }
      const flat = CHARACTER_FLAT_BONUS[characterId] || 0;
      if (result.correct && flat > 0) {
        bonusCoins += flat;
        bonusLabel = bonusLabel
          ? `${bonusLabel} · Coach bonus +${flat}`
          : `Coach bonus +${flat} from ${characterId.charAt(0).toUpperCase() + characterId.slice(1)}!`;
      }
      const totalAwarded = result.coins_earned + bonusCoins;
      const enriched = { ...result, coins_earned: totalAwarded };

      setFeedback(enriched);
      if (result.correct) {
        sfx.correct();
        sfx.coin();
        setSolvedIds((prev) => new Set(prev).add(current.id));
        setScore((s) => s + 1);
        setCompanionMood("happy");
        setCompanionSpeech(getCharacterLine(characterId, "onCorrect"));
        if (bonusCoins > 0) {
          toast.success(`Correct! +${result.coins_earned} coins`, {
            description: bonusLabel,
          });
        } else {
          toast.success(`Correct! +${result.coins_earned} coins`);
        }
      } else {
        sfx.wrong();
        setCompanionMood("sad");
        setCompanionSpeech(getCharacterLine(characterId, "onWrong"));
        toast.error("Not quite!", { description: `Answer: ${result.correct_answer}` });
      }
    } catch {
      toast.error("Could not submit answer.");
    }
  };

  const handleHint = async () => {
    if (!current) return;
    // Free hint via specialty bonus
    if (freeHintAvailable) {
      try {
        const h = await getHint(current.id);
        setHintShown(h.hint);
        setFreeHintAvailable(false);
        sfx.hint();
        toast(`${characterId.charAt(0).toUpperCase() + characterId.slice(1)} gave you a free hint!`);
        setCompanionMood("thinking");
        return;
      } catch {
        toast.error("Could not fetch hint.");
        return;
      }
    }
    if ((player?.coins ?? 0) < 15) {
      toast.error("Not enough coins for a hint", {
        description: "Visit the shop to top up!",
      });
      return;
    }
    try {
      const h = await getHint(current.id);
      setHintShown(h.hint);
      const newCoins = (player.coins || 0) - 15;
      const updated = { ...player, coins: newCoins };
      setPlayer(updated);
      await updateProgress({
        player_id: getPlayerId(),
        level: levelNum,
        coins: -15,
      });
      sfx.hint();
      toast("Hint unlocked", { description: "-15 coins" });
      setCompanionMood("thinking");
    } catch {
      toast.error("Could not fetch hint.");
    }
  };

  const next = () => {
    setFeedback(null);
    setHintShown(null);
    setIdx((i) => i + 1);
    setCompanionMood("idle");
    setCompanionSpeech("");
    setShowScene(true);
    sfx.click();
  };

  const handleSwitchCharacter = (newId) => {
    setCharacterId(newId);
    saveCharacter(newId);
    setCompanionMood("idle");
    setCompanionSpeech(getCharacterLine(newId, "onLevelStart"));
    const nowSpecialty = CHARACTER_SPECIALTY_LEVEL[newId] === levelNum;
    if (nowSpecialty && !freeHintAvailable) {
      setFreeHintAvailable(true);
    }
    toast(
      `Switched to ${newId.charAt(0).toUpperCase() + newId.slice(1)}!${
        nowSpecialty ? " Specialty bonus active." : ""
      }`
    );
  };

  const finishLevel = async () => {
    const stars = totalPuzzles
      ? score >= totalPuzzles
        ? 3
        : score >= Math.ceil(totalPuzzles * 0.7)
        ? 2
        : score >= Math.ceil(totalPuzzles * 0.4)
        ? 1
        : 0
      : 0;
    const baseCoinsPerCorrect = { easy: 10, medium: 20, hard: 35 }[difficulty] || 20;
    const earned = score * baseCoinsPerCorrect;
    try {
      const updated = await updateProgress({
        player_id: getPlayerId(),
        level: levelNum,
        completed: true,
        coins: 0, // coins already credited per answer? — backend not auto-crediting; we explicitly grant once
        stars,
      });
      // Grant bonus coins for finishing
      const final = await updateProgress({
        player_id: getPlayerId(),
        level: levelNum,
        coins: earned,
      });
      setPlayer(final);
    } catch {
      // ignore
    }
    toast.success(`Level ${levelNum} complete! ${"⭐".repeat(stars)}`);
    sfx.levelUp();
  };

  // Save coins per correct answer to backend
  useEffect(() => {
    if (feedback?.correct) {
      updateProgress({
        player_id: getPlayerId(),
        level: levelNum,
        coins: feedback.coins_earned,
      })
        .then(setPlayer)
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback]);

  // When level finishes, persist completion once
  useEffect(() => {
    if (completedAll && !loading) {
      finishLevel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedAll, loading]);

  // Play level music + greet on level load
  useEffect(() => {
    if (!loading) {
      playMusic("level");
    }
    if (!loading && isSpecialty) {
      setFreeHintAvailable(true);
    }
    if (!loading) {
      setCompanionSpeech(getCharacterLine(characterId, "onLevelStart"));
      setCompanionMood("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, levelNum, characterId]);

  const bg = BACKGROUNDS[level?.background] || BACKGROUNDS.level_1;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-amber-100"
        data-testid="gameplay-loading"
      >
        <div className="font-display text-3xl text-slate-700 animate-pulse">
          Loading quest…
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-amber-100"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.55), rgba(15,23,42,0.75)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      data-testid="gameplay-page"
    >
      <GameNav player={player} onOpenShop={() => setShopOpen(true)} trackKey="level" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Level header */}
        <div className="tactile-card bg-white p-4 sm:p-5 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-accent text-sky-700 text-sm">
                LEVEL {levelNum} • {difficulty.toUpperCase()}
              </span>
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
                {level?.name || "Quest"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="tactile-chip text-emerald-700">
                <Check className="w-4 h-4" strokeWidth={3} /> {score}
              </span>
              <span className="tactile-chip text-slate-700">
                {Math.min(idx + 1, totalPuzzles)} / {totalPuzzles}
              </span>
            </div>
          </div>
        </div>

        {/* Intro panel */}
        {introOpen && !completedAll && (
          <div
            className="tactile-card bg-amber-50 p-5 mb-5 animate-pop-in"
            data-testid="level-intro"
          >
            <p className="text-slate-800 font-semibold leading-relaxed">
              {LEVEL_INTROS[levelNum]}
            </p>
            {isSpecialty && (
              <div
                className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-100 border-2 border-slate-800 text-sm font-bold text-amber-800"
                data-testid="specialty-banner"
              >
                <Star className="w-4 h-4" strokeWidth={3} fill="#FBBF24" />
                {characterId.charAt(0).toUpperCase() + characterId.slice(1)}'s
                specialty level — +10 coin bonus &amp; 1 free hint!
              </div>
            )}
            <div className="mt-4 text-right">
              <TactileButton
                color="#38BDF8"
                size="sm"
                icon={ArrowRight}
                onClick={() => setIntroOpen(false)}
                data-testid="dismiss-intro-button"
              >
                Begin Puzzles
              </TactileButton>
            </div>
          </div>
        )}

        {/* Hotspot scene — click an object to start its puzzle */}
        {!completedAll && !introOpen && showScene && current && (
          <div className="mb-5 animate-pop-in" data-testid="scene-container">
            <HotspotScene
              levelId={levelNum}
              background={bg}
              puzzles={puzzles}
              solvedIds={solvedIds}
              currentIdx={idx}
              characterId={characterId}
              onPick={(i) => {
                if (i === idx) {
                  setShowScene(false);
                } else {
                  toast(
                    `Solve the highlighted hotspot first to unlock the others!`
                  );
                }
              }}
            />
            <p className="mt-2 text-center text-xs font-bold text-white/90 bg-slate-900/40 rounded-full inline-block px-3 py-1 ml-auto">
              Tap the glowing object to inspect it.
            </p>
          </div>
        )}

        {/* Puzzle */}
        {!completedAll && !introOpen && !showScene && current && (
          <div
            className="tactile-card bg-white p-6 sm:p-7 space-y-5 animate-pop-in"
            data-testid="puzzle-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="font-accent text-sm text-slate-500 uppercase">
                  {current.type} • {current.category}
                </span>
                <h2
                  className="font-display font-bold text-xl sm:text-2xl text-slate-900 mt-1"
                  data-testid="puzzle-question"
                >
                  {current.question}
                </h2>
              </div>
              <button
                onClick={() => setShowScene(true)}
                className="tactile-btn bg-white text-slate-800 px-3 py-2 text-xs"
                data-testid="back-to-scene-button"
                aria-label="Back to scene"
              >
                <MapIcon className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            {hintShown && (
              <div
                className="rounded-2xl border-2 border-slate-800 bg-amber-100 p-3 text-sm font-semibold text-slate-800 flex gap-2 items-start"
                data-testid="hint-shown"
              >
                <Lightbulb
                  className="w-5 h-5 text-amber-600 mt-0.5"
                  strokeWidth={3}
                />
                <span>{hintShown}</span>
              </div>
            )}

            {current.type === "pattern" ? (
              <PatternPuzzle
                puzzle={current}
                onSubmit={handleSubmit}
                disabled={!!feedback}
              />
            ) : (
              <TriviaPuzzle
                puzzle={current}
                onSubmit={handleSubmit}
                locked={!!feedback}
              />
            )}

            {/* Feedback */}
            {feedback && (
              <div
                className={`rounded-2xl border-4 p-4 ${
                  feedback.correct
                    ? "bg-emerald-100 border-emerald-700"
                    : "bg-rose-100 border-rose-700"
                }`}
                data-testid={feedback.correct ? "feedback-correct" : "feedback-wrong"}
              >
                <div className="flex items-center gap-2 font-display font-bold text-lg">
                  {feedback.correct ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-700" strokeWidth={3} />
                      <span className="text-emerald-900">Brilliant!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-rose-700" strokeWidth={3} />
                      <span className="text-rose-900">
                        Answer: {feedback.correct_answer}
                      </span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-800">
                  {feedback.explanation}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <TactileButton
                color={freeHintAvailable ? "#4ADE80" : "#FBBF24"}
                textColor="#1E293B"
                size="sm"
                icon={Lightbulb}
                onClick={handleHint}
                disabled={!!hintShown || !!feedback}
                data-testid="hint-button"
              >
                {freeHintAvailable ? "Free Hint!" : "Hint (15 coins)"}
              </TactileButton>

              {feedback && (
                <TactileButton
                  color="#38BDF8"
                  size="md"
                  icon={ArrowRight}
                  onClick={next}
                  data-testid="next-puzzle-button"
                >
                  {idx + 1 < totalPuzzles ? "Next" : "Finish Level"}
                </TactileButton>
              )}
            </div>
          </div>
        )}

        {/* Level complete */}
        {completedAll && (
          <div
            className="tactile-card bg-white p-6 sm:p-8 text-center animate-celebrate"
            data-testid="level-complete"
          >
            <Trophy className="w-16 h-16 mx-auto text-amber-500" strokeWidth={3} />
            <h2 className="font-display font-bold text-3xl text-slate-900 mt-2">
              Level Complete!
            </h2>
            <p className="text-slate-700 font-semibold">
              You answered {score} of {totalPuzzles} correctly.
            </p>

            <div className="my-5 flex justify-center gap-2">
              {[1, 2, 3].map((s) => {
                const earned =
                  score >= totalPuzzles
                    ? 3
                    : score >= Math.ceil(totalPuzzles * 0.7)
                    ? 2
                    : score >= Math.ceil(totalPuzzles * 0.4)
                    ? 1
                    : 0;
                return (
                  <Star
                    key={s}
                    className="w-12 h-12"
                    strokeWidth={3}
                    fill={s <= earned ? "#FBBF24" : "transparent"}
                    color={s <= earned ? "#FBBF24" : "#94A3B8"}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <TactileButton
                color="#38BDF8"
                icon={MapIcon}
                onClick={() => navigate("/map")}
                data-testid="back-to-map-button"
              >
                Back to Map
              </TactileButton>
              <TactileButton
                color="#F472B6"
                onClick={() => navigate("/tetris")}
                data-testid="play-tetris-interlude"
              >
                Quick Block Break
              </TactileButton>
              {levelNum < 5 ? (
                <TactileButton
                  color="#4ADE80"
                  icon={ArrowRight}
                  onClick={() => navigate(`/play/${levelNum + 1}`)}
                  data-testid="next-level-button"
                >
                  Next Level
                </TactileButton>
              ) : (
                <TactileButton
                  color="#F472B6"
                  icon={Trophy}
                  onClick={() => navigate("/")}
                  data-testid="game-end-button"
                >
                  Hall of Fame
                </TactileButton>
              )}
            </div>
          </div>
        )}
      </main>

      <ShopDrawer
        open={shopOpen}
        onOpenChange={setShopOpen}
        onPlayerUpdate={setPlayer}
      />

      <CharacterCompanion
        characterId={characterId}
        mood={companionMood}
        speech={companionSpeech}
        levelId={levelNum}
        onSwitch={handleSwitchCharacter}
      />
    </div>
  );
}
