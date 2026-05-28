import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import MainMenu from "@/pages/MainMenu";
import LevelMap from "@/pages/LevelMap";
import GamePlay from "@/pages/GamePlay";
import EndlessMode from "@/pages/EndlessMode";
import StoryIntro from "@/pages/StoryIntro";
import TetrisPage from "@/pages/TetrisPage";
import DailyChallenge from "@/pages/DailyChallenge";
import Leaderboard from "@/pages/Leaderboard";
import Homestead from "@/pages/Homestead";
import { applyAccessibility } from "@/lib/gameStore";

function App() {
  useEffect(() => {
    applyAccessibility();
  }, []);
  return (
    <div className="App" data-testid="strayz-app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/story" element={<StoryIntro />} />
          <Route path="/map" element={<LevelMap />} />
          <Route path="/play/:levelId" element={<GamePlay />} />
          <Route path="/endless" element={<EndlessMode />} />
          <Route path="/tetris" element={<TetrisPage />} />
          <Route path="/daily" element={<DailyChallenge />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/homestead" element={<Homestead />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default App;
