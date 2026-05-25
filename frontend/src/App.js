import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import MainMenu from "@/pages/MainMenu";
import LevelMap from "@/pages/LevelMap";
import GamePlay from "@/pages/GamePlay";
import EndlessMode from "@/pages/EndlessMode";
import StoryIntro from "@/pages/StoryIntro";
import TetrisPage from "@/pages/TetrisPage";

function App() {
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
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default App;
