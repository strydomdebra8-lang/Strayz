# Strayz - Educational Point-and-Click Adventure Game

## Original Problem Statement
A point and click game that includes brain teasers, puzzles and riddles as well as music trivia and general knowledge that need to be solved for every progressive level with each choice of degree of difficulty that includes a story line and that has in-app purchases. Characters should be a family of youthful persons and of various ages. If and where possible, combination of Carmen Sandiego, The Neverhood, Tetris with a hint of Lara Croft Tomb Raider, Clash of Clans, and Hay Day. Where possible the game is to be educational.

## User Choices
- **In-app purchases**: Mock/placeholder
- **MVP scope**: 3-5 levels, basic storyline, single difficulty selectable; all included
- **Content generation**: Mix of pre-defined + AI-generated puzzles
- **Educational focus**: Mix of all subjects (Math, Logic, Music, History, Geography, Science, Nature)
- **Visual style**: Vibrant, family-friendly adventure
- **Game name**: Strayz

## Architecture
- **Frontend**: React 19 + React Router + Tailwind + Shadcn/UI components
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **AI**: Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) via emergentintegrations + EMERGENT_LLM_KEY
- **Design**: Tactile / Vibrant Play archetype - chunky borders, offset shadows, Fredoka + Nunito + Bebas Neue typography

## User Personas
- Kids 8-14 learning through play
- Teens enjoying music/trivia challenges
- Family co-op solving together
- Adults practicing brain teasers

## Core Requirements (Static)
- Progressive levels with difficulty selection (Easy/Medium/Hard)
- Multiple puzzle types: trivia, riddles, pattern memory
- 5 themed locations with educational categories
- Story narration & character family
- Mock in-app purchases (coins, gems, bundles)
- AI endless riddle mode
- Local progress tracking + backend persistence

## What's Implemented (2026-02-25)
### Backend (`/app/backend/server.py`)
- `GET /api/levels` - 5 levels metadata
- `GET /api/puzzles/{level}` - serves pre-defined puzzles (answers hidden)
- `POST /api/answer` - validates puzzle answer, awards coins
- `GET /api/hint/{puzzle_id}` - puzzle hint
- `GET /api/player/{id}` - auto-creates player; `POST /api/player`, `POST /api/progress`
- `GET /api/shop/packs` - 5 mock IAP packs; `POST /api/shop/purchase` - mock purchase
- `POST /api/ai/riddle` - Claude Sonnet 4.5 generates dynamic riddles
- `puzzles_data.py` - 21 trivia/riddle + 5 pattern puzzles

### Frontend
- `/` MainMenu - title, character picker (4 family members), difficulty picker, name dialog, 3 CTAs
- `/story` StoryIntro - 6 dialogue beats with character avatars
- `/map` LevelMap - 5 level bento cards with stars & lock states
- `/play/:levelId` GamePlay - level intro, sequential puzzle solving, hints, feedback, level complete with stars
- `/endless` EndlessMode - AI-generated infinite riddles by category with streak counter
- `ShopDrawer` - sliding drawer with 5 packs
- `GameNav` - sticky nav with coin/gem balance + shop button

### Testing
- 24/24 backend pytest tests pass
- Full E2E frontend flow verified by testing agent
- All interactive elements have `data-testid` attributes

## Prioritized Backlog
### P0 (Future)
- Distinct character portraits for all 4 family members (Max, Zoe, Leo, Maya)
- Sound effects + background music toggle

### P1
- Real payment integration (Stripe) for IAP
- Tetris-style block-stacking mini-game
- Daily challenge / streak rewards
- Achievement system with badges

### P2
- Leaderboards (per-difficulty)
- Multi-language support
- Mobile-optimized touch gestures
- Boss-level cutscene animations
- More AI puzzle categories (logic chains, word ladders)


## Iteration 3 Update (2026-02-25) — "Best Game Ever" Push
- ✅ Added 4 distinct DiceBear character portraits (chris/archie/lynn/deb)
- ✅ Sound system: Web Audio API SFX (correct/wrong/coin/hint/click/levelUp/pop/drop/rotate/lineClear) + Howler background music with graceful fallback
- ✅ Sound toggle in nav (persists to localStorage)
- ✅ Clickable hotspots overlay on level backgrounds — TRUE point-and-click feel; 6 hotspots per level
- ✅ Tetris Mini block-stacking game on /tetris route with full controls (kbd + buttons)
- ✅ CSS-3D treasure chest hero scene on main menu (replaced R3F due to React 19 incompat)
- ✅ "Quick Block Break" interlude button on level complete card
- ✅ Character interactivity polished: SFX-synced moods/speech, music per page (menu/level/endless)

## Known Limitations
- Background music URLs (Mixkit) return 403 — feature degrades gracefully (SFX still works). User can replace with own tracks in `/app/frontend/src/lib/sound.js` BG_TRACKS.
- Hero3D is CSS-based, not WebGL. True 3D requires R3F v9 + Node 22 (current env is Node 20).

## Remaining Backlog
- P1: Real audio assets (music + voice clips)
- P1: Animated character walk-cycles on hotspot scenes
- P1: Inventory of recovered artifacts
- P2: Convert one level to real WebGL 3D scene (after Node 22 env upgrade)
- P2: Daily challenge + leaderboard
- P2: Real Stripe IAP integration

