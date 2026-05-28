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

## Iteration 4–5 Update (2026-02-26) — 6 Family Members + Power Features
- ✅ 6 unique Gemini Nano Banana AI portraits (Chris, Archie, Lynn, Deb, parents Dolly & Arthur)
- ✅ Level 6 "Sports Arena" with Coach Arthur
- ✅ Portrait Editor — upload or AI-generate custom portrait per character, stored in localStorage
- ✅ Achievements drawer (8 badges) with auto-unlock hooks
- ✅ Leaderboard (top 10 by coins)
- ✅ Daily Challenge — one puzzle per character, deterministic per date
- ✅ Login streak rewards
- ✅ Fixed: nested-button hydration warning (now uses div role=button)
- ✅ Fixed: DailyChallenge portrait override via resolveCharacterImage
- ✅ Fixed: /api/portrait/generate emits correct MIME from magic-byte sniff

## Iteration 6 Update (2026-02-28) — Hay Day / Clash of Clans Mini-Loop
- ✅ Strayz Homestead at `/homestead` — persistent 3×3 farm (4 starter plots, expandable to 9)
- ✅ 5 crops with timer-based growth: Wheat 30s, Carrot 2m, Berry 5m, Pumpkin 15m, Starfruit 30m
- ✅ Coins-in → coins-out economy with XP-based homestead level gating rarer crops
- ✅ Gem boost: spend 1 gem to instantly finish a growing crop
- ✅ Expand plots via coin cost ladder [200, 500, 1200, 2500, 5000]
- ✅ 3 new achievements (Green Thumb, Land Baron, Master Farmer)
- ✅ Live countdown UI with progress bar + harvest pulse animation
- ✅ Backend endpoints: GET /api/homestead/{player_id}, POST /plant /harvest /boost /expand, GET /crops
- ✅ Fixed pre-existing backend crash: missing LoginClaimRequest model definition
- ✅ 46/46 backend pytest tests pass; 14/14 frontend Homestead flows verified

## Iteration 7 Update (2026-02-28) — Defense Tower (Clash of Clans Combat)
- ✅ Strayz Defense Tower at `/defense` — castle wall visualization (grows with level), shields HUD
- ✅ Raid system: 5 puzzles from main bank, lose shield on wrong, survive for coin reward
- ✅ Wall upgrade ladder [150, 400, 900, 1800, 3500] → Lv6 = 8 shields, 300c per raid reward
- ✅ Server-authoritative rewards (raid_reward derived from server wall_level, no client trust)
- ✅ 2 new achievements (Castle Defender, Fortress Keeper)
- ✅ Backend endpoints: GET /api/defense/{player_id}, /defense/raid/start, POST /defense/upgrade, /defense/raid/resolve
- ✅ 52/52 backend pytest tests pass; 100% frontend Defense flows verified

## Iteration 8 Update (2026-02-28) — Viral Share Card
- ✅ Shareable stat card at `/share` — gradient design, character portrait, dynamic tagline (Rising Stray → World Liberator)
- ✅ 6-stat snapshot: Coins, Gems, Stars, Levels, Farm Lv, Raids
- ✅ Download as PNG (via html2canvas, scale 2× retina-quality)
- ✅ Copy tweet text to clipboard with emoji-formatted stats + URL
- ✅ Native Web Share API with graceful copy-text fallback
- ✅ Pink "Share Card" CTA on MainMenu (10 total CTAs now)
- ✅ Backend endpoint: GET /api/share-card/{player_id}
- ✅ 55/55 backend pytest tests pass; 100% frontend Share flows verified

## Iteration 9 Update (2026-02-28) — Friend Codes + Daily Duel (Multiplayer Hook)
- ✅ Each player auto-generates a unique friend code: STRY-XXXX (4 random A-Z0-9)
- ✅ `/friends` page: copy-my-code, add-by-code, friend list with stats, remove
- ✅ Daily Duel leaderboard: me + my friends sorted by today's daily-challenge score
- ✅ DailyChallenge auto-submits score to duel on completion
- ✅ Best-score logic — submitting a lower score after a high one does NOT overwrite
- ✅ 2 new achievements (Buddy System, Crew of Three)
- ✅ Indigo "Friends" CTA on MainMenu (11 total CTAs)
- ✅ Backend endpoints: GET /api/friend-code/{id}, /friend/lookup/{code}, /friends/{id}, /duel/scores/{id}; POST /friend/add, /duel/submit; DELETE /friend/{me}/{friend}
- ✅ 64/65 backend tests pass (10/10 new Friend+Duel tests, 1 unrelated infra failure on portrait LLM budget)
- ✅ 100% frontend flows verified including duplicate-add, self-add, invalid-code, remove

## Known Limitation
- /api/portrait/generate may return 500 when Emergent LLM budget is exhausted. To top up: Profile → Universal Key → Add Balance. Not a code defect.

## 🚀 LAUNCH READY (2026-02-28)
The game now has all 6 inspirational pillars from the original prompt:
- Carmen Sandiego (point-and-click locations) ✓
- The Neverhood (vibrant family-friendly art) ✓
- Tetris (Block Break mini-game) ✓
- Tomb Raider (artifact recovery quests) ✓
- Clash of Clans (Defense Tower wall upgrades + raids) ✓
- Hay Day (Homestead farming loop) ✓

## Known Limitations
- Background music URLs (Mixkit) return 403 — feature degrades gracefully (SFX still works). User can replace with own tracks in `/app/frontend/src/lib/sound.js` BG_TRACKS.
- Hero3D is CSS-based, not WebGL. True 3D requires R3F v9 + Node 22 (current env is Node 20).
- In-app purchases remain MOCKED (no real Stripe integration yet).

## Remaining Backlog
- P1: Real Stripe IAP integration (currently mock)
- P1: Refactor large GamePlay.jsx (~600 lines) into smaller components
- P1: Animated character walk-cycles on hotspot scenes
- P1: Inventory of recovered artifacts
- P2: Convert one level to real WebGL 3D scene (after Node 22 env upgrade)
- P2: Real audio assets (music + voice clips)
- P2: Combine Homestead with combat tower (Clash of Clans defense element)
- P2: Multi-language support


