import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import GameNav from "@/components/GameNav";
import TetrisMini from "@/components/TetrisMini";
import TactileButton from "@/components/TactileButton";

export default function TetrisPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-amber-100 bg-grain" data-testid="tetris-page">
      <GameNav player={null} onOpenShop={() => navigate("/")} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-6">
          <span className="font-accent text-violet-700">BLOCK BREAK</span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 text-shadow-pop">
            Tetris Mini
          </h1>
          <p className="text-slate-700 font-semibold mt-2">
            A classic block-stacking interlude between quests.
          </p>
        </div>
        <TetrisMini onClose={() => navigate("/")} />
        <div className="text-center mt-6">
          <TactileButton
            color="#FFFFFF"
            textColor="#1E293B"
            icon={Home}
            onClick={() => navigate("/")}
            data-testid="tetris-back-home"
          >
            Back Home
          </TactileButton>
        </div>
      </main>
    </div>
  );
}
