import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CalendarCheck, Check, X, Star, ArrowRight, Trophy } from "lucide-react";
import GameNav from "@/components/GameNav";
import ShopDrawer from "@/components/ShopDrawer";
import TactileButton from "@/components/TactileButton";
import TriviaPuzzle from "@/components/TriviaPuzzle";
import CharacterCompanion from "@/components/CharacterCompanion";
import { CHARACTERS, getCharacterLine } from "@/data/storyData";
import { resolveCharacterImage } from "@/lib/portraits";
import { sfx, playMusic } from "@/lib/sound";
import { getDailyChallenge, submitAnswer, getPlayer, updateProgress } from "@/lib/api";
import { getPlayerId, getDifficulty, getCharacter } from "@/lib/gameStore";
import { earn } from "@/lib/achievements";

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [companionMood, setCompanionMood] = useState("idle");
  const [companionSpeech, setCompanionSpeech] = useState("");
  const difficulty = getDifficulty();

  useEffect(() => {
    getDailyChallenge().then(setData).catch(() => toast.error("Could not load challenge"));
    getPlayer(getPlayerId()).then(setPlayer).catch(() => {});
    playMusic("menu");
  }, []);

  useEffect(() => {
    if (data && idx >= (data.challenges?.length ?? 0) && score === data.challenges?.length) {
      earn("daily-perfect");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, score, data]);

  const current = data?.challenges?.[idx];
  const total = data?.challenges?.length ?? 0;
  const completedAll = data && idx >= total;
  const activeCharacterId = current?.character_id || getCharacter();
  const activeChar = CHARACTERS.find((c) => c.id === activeCharacterId);

  const submit = async (selected) => {
    if (!current || feedback) return;
    try {
      const r = await submitAnswer({
        puzzle_id: current.puzzle.id,
        selected,
        difficulty,
      });
      setFeedback(r);
      if (r.correct) {
        sfx.correct();
        sfx.coin();
        setScore((s) => s + 1);
        setCompanionMood("happy");
        setCompanionSpeech(getCharacterLine(activeCharacterId, "onCorrect"));
        toast.success(`Correct! +${r.coins_earned} coins`);
        const upd = await updateProgress({
          player_id: getPlayerId(),
          level: 0,
          coins: r.coins_earned,
        });
        setPlayer(upd);
      } else {
        sfx.wrong();
        setCompanionMood("sad");
        setCompanionSpeech(getCharacterLine(activeCharacterId, "onWrong"));
        toast.error("Wrong", { description: `Answer: ${r.correct_answer}` });
      }
    } catch {
      toast.error("Submit failed");
    }
  };

  const next = () => {
    setFeedback(null);
    setIdx((i) => i + 1);
    setCompanionMood("idle");
    setCompanionSpeech("");
  };

  return (
    <div
      className="min-h-screen bg-amber-100"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(251,191,36,0.35), transparent 50%), radial-gradient(circle at 80% 80%, rgba(244,114,182,0.35), transparent 50%)",
      }}
      data-testid="daily-challenge-page"
    >
      <GameNav player={player} onOpenShop={() => setShopOpen(true)} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center">
          <span className="font-accent text-pink-700 inline-flex items-center gap-2">
            <CalendarCheck className="w-4 h-4" strokeWidth={3} />
            {data?.date || "TODAY"}
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 text-shadow-pop">
            Family Challenge
          </h1>
          <p className="text-slate-700 font-semibold mt-2">
            One puzzle per Stray, refreshed daily. Solve them all for a crown badge.
          </p>
          <span className="tactile-chip text-emerald-700 mt-3" data-testid="daily-progress">
            <Check className="w-4 h-4" strokeWidth={3} /> {score} / {total}
          </span>
        </div>

        {!data && (
          <div className="mt-10 text-center text-slate-600 font-bold animate-pulse">
            Loading today's challenge…
          </div>
        )}

        {data && !completedAll && current && (
          <div
            className="mt-6 tactile-card bg-white p-6 sm:p-7 animate-pop-in space-y-4"
            data-testid="daily-puzzle-card"
          >
            <div className="flex items-center gap-3">
              {activeChar && (
                <img
                  src={resolveCharacterImage(activeChar)}
                  alt={activeChar.name}
                  className="w-14 h-14 rounded-2xl border-4 border-slate-800 object-cover"
                  style={{ backgroundColor: (activeChar.color || "#fff") + "30" }}
                />
              )}
              <div>
                <span className="font-accent text-sm text-slate-500 uppercase">
                  {activeChar?.role} • {current.puzzle.category}
                </span>
                <p className="font-display font-bold text-slate-900">
                  {activeChar?.name}'s daily puzzle
                </p>
              </div>
            </div>
            <h2
              className="font-display font-bold text-xl sm:text-2xl text-slate-900"
              data-testid="daily-puzzle-question"
            >
              {current.puzzle.question}
            </h2>
            <TriviaPuzzle puzzle={current.puzzle} onSubmit={submit} locked={!!feedback} />
            {feedback && (
              <div
                className={`rounded-2xl border-4 p-4 ${
                  feedback.correct
                    ? "bg-emerald-100 border-emerald-700"
                    : "bg-rose-100 border-rose-700"
                }`}
              >
                <div className="flex items-center gap-2 font-display font-bold text-lg">
                  {feedback.correct ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-700" strokeWidth={3} />
                      <span className="text-emerald-900">Correct!</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-rose-700" strokeWidth={3} />
                      <span className="text-rose-900">Answer: {feedback.correct_answer}</span>
                    </>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-800">{feedback.explanation}</p>
              </div>
            )}
            {feedback && (
              <div className="text-right">
                <TactileButton
                  color="#38BDF8"
                  size="md"
                  icon={ArrowRight}
                  onClick={next}
                  data-testid="daily-next-button"
                >
                  {idx + 1 < total ? "Next Stray" : "Finish"}
                </TactileButton>
              </div>
            )}
          </div>
        )}

        {completedAll && (
          <div
            className="mt-8 tactile-card bg-white p-7 text-center animate-celebrate"
            data-testid="daily-complete"
          >
            <Trophy className="w-16 h-16 mx-auto text-amber-500" strokeWidth={3} />
            <h2 className="font-display font-bold text-3xl text-slate-900 mt-2">
              Family Champion!
            </h2>
            <p className="text-slate-700 font-semibold">
              You answered {score} of {total} correctly.
            </p>
            {score === total && (
              <div className="my-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-200 border-2 border-slate-800 font-bold">
                <Star className="w-5 h-5 text-amber-700" strokeWidth={3} fill="#FBBF24" />
                Crown Badge Earned!
              </div>
            )}
            <div className="mt-4">
              <TactileButton color="#38BDF8" onClick={() => navigate("/")} data-testid="daily-home">
                Back to Menu
              </TactileButton>
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
        characterId={activeCharacterId}
        mood={companionMood}
        speech={companionSpeech}
        levelId={0}
      />
    </div>
  );
}
