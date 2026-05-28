"""Strayz - educational point-and-click adventure game backend."""

from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import random
import uuid
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Optional, Literal

from pydantic import BaseModel, Field, ConfigDict

from puzzles_data import PUZZLE_BANK, PATTERN_PUZZLES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ------------------- DB -------------------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# ------------------- App -------------------
app = FastAPI(title="Strayz API")
api_router = APIRouter(prefix="/api")


# ------------------- Models -------------------
class AnswerSubmission(BaseModel):
    puzzle_id: str
    selected: str
    difficulty: Literal["easy", "medium", "hard"] = "medium"


class AnswerResult(BaseModel):
    correct: bool
    correct_answer: str
    explanation: str
    coins_earned: int


class ProgressUpdate(BaseModel):
    player_id: str
    level: int
    completed: bool = False
    coins: int = 0
    stars: int = 0


class PlayerProgress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    player_id: str
    name: str = "Adventurer"
    coins: int = 100
    gems: int = 5
    levels_completed: List[int] = Field(default_factory=list)
    level_stars: dict = Field(default_factory=dict)
    selected_character: str = "chris"
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class ShopPurchaseRequest(BaseModel):
    player_id: str
    pack_id: str


class AIRiddleRequest(BaseModel):
    category: str = "logic"
    difficulty: str = "medium"


class PortraitGenRequest(BaseModel):
    character_id: str
    description: str


# In-memory cache of all puzzles, generated with stable IDs
_PUZZLE_CACHE: List[dict] = []


def build_puzzle_cache():
    cache = []
    for i, p in enumerate(PUZZLE_BANK):
        puzzle = dict(p)
        puzzle["id"] = f"trivia-{i}"
        cache.append(puzzle)
    for i, p in enumerate(PATTERN_PUZZLES):
        puzzle = dict(p)
        puzzle["id"] = f"pattern-{i}"
        cache.append(puzzle)
    return cache


_PUZZLE_CACHE = build_puzzle_cache()


def find_puzzle(puzzle_id: str) -> Optional[dict]:
    for p in _PUZZLE_CACHE:
        if p["id"] == puzzle_id:
            return p
    return None


# ------------------- Routes -------------------
@api_router.get("/")
async def root():
    return {"message": "Strayz API running", "game": "Strayz"}


@api_router.get("/levels")
async def get_levels():
    """Return level metadata for the world map."""
    levels = [
        {
            "id": 1,
            "name": "Jungle Ruins",
            "subject": "Math & Logic",
            "color": "#4ADE80",
            "icon": "TreePine",
            "description": "Ancient Mayan ruins hide a stolen artifact. Solve number and logic riddles!",
            "background": "level_1",
        },
        {
            "id": 2,
            "name": "Musical Museum",
            "subject": "Music Trivia",
            "color": "#FB923C",
            "icon": "Music",
            "description": "The Symphony Crystal has vanished from the museum. Show your musical wits!",
            "background": "level_2",
        },
        {
            "id": 3,
            "name": "Ancient Library",
            "subject": "History & Geography",
            "color": "#38BDF8",
            "icon": "BookOpen",
            "description": "A vault of lost knowledge awaits. Race against time to recover scrolls.",
            "background": "level_3",
        },
        {
            "id": 4,
            "name": "Science Lab",
            "subject": "Science & Nature",
            "color": "#A78BFA",
            "icon": "FlaskConical",
            "description": "A famous lab has been ransacked. Identify clues using science skills.",
            "background": "level_4",
        },
        {
            "id": 5,
            "name": "Final Showdown",
            "subject": "Mixed Mastery",
            "color": "#F472B6",
            "icon": "Crown",
            "description": "The mastermind's lair! Bring everything you've learned to this final test.",
            "background": "level_5",
        },
        {
            "id": 6,
            "name": "Sports Arena",
            "subject": "Sports & Endurance",
            "color": "#22D3EE",
            "icon": "Trophy",
            "description": "A legendary trophy has been stolen from the great Sports Arena. Coach Arthur leads the charge!",
            "background": "level_6",
        },
    ]
    return {"levels": levels}


@api_router.get("/puzzles/{level}")
async def get_puzzles_for_level(level: int, difficulty: str = "medium"):
    """Return puzzles for a given level (without revealing answers)."""
    if level < 1 or level > 6:
        raise HTTPException(status_code=400, detail="Invalid level")

    puzzles = [p for p in _PUZZLE_CACHE if p["level"] == level]

    # Optionally shuffle starting order
    pool = list(puzzles)
    if difficulty == "hard":
        random.shuffle(pool)

    # Greedy interleave: always pick the next puzzle whose category != last picked
    interleaved: List[dict] = []
    used = [False] * len(pool)
    last_cat: Optional[str] = None
    while True:
        # Find first unused puzzle whose category differs from last_cat
        chosen_idx = -1
        for i, p in enumerate(pool):
            if used[i]:
                continue
            if p["category"] != last_cat:
                chosen_idx = i
                break
        if chosen_idx == -1:
            # No category-distinct option left; pick any remaining
            for i, p in enumerate(pool):
                if not used[i]:
                    chosen_idx = i
                    break
        if chosen_idx == -1:
            break
        used[chosen_idx] = True
        interleaved.append(pool[chosen_idx])
        last_cat = pool[chosen_idx]["category"]

    # Strip answers
    public_puzzles = []
    for p in interleaved:
        public_puzzles.append(
            {
                "id": p["id"],
                "level": p["level"],
                "type": p["type"],
                "category": p["category"],
                "question": p["question"],
                "options": p.get("options"),
                "sequence": p.get("sequence"),
            }
        )

    return {"level": level, "difficulty": difficulty, "puzzles": public_puzzles}


@api_router.post("/answer", response_model=AnswerResult)
async def submit_answer(submission: AnswerSubmission):
    puzzle = find_puzzle(submission.puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")

    correct_answer = puzzle.get("answer")
    is_correct = False

    if puzzle["type"] == "pattern":
        try:
            submitted = json.loads(submission.selected)
        except Exception:
            submitted = [s.strip() for s in submission.selected.split(",")]
        is_correct = submitted == puzzle.get("sequence", [])
        correct_answer = ",".join(puzzle.get("sequence", []))
    else:
        is_correct = (
            submission.selected.strip().lower()
            == (correct_answer or "").strip().lower()
        )

    base_reward = {"easy": 10, "medium": 20, "hard": 35}.get(submission.difficulty, 20)
    coins_earned = base_reward if is_correct else 0

    return AnswerResult(
        correct=is_correct,
        correct_answer=correct_answer or "",
        explanation=puzzle.get("explanation", ""),
        coins_earned=coins_earned,
    )


@api_router.get("/hint/{puzzle_id}")
async def get_hint(puzzle_id: str):
    puzzle = find_puzzle(puzzle_id)
    if not puzzle:
        raise HTTPException(status_code=404, detail="Puzzle not found")
    return {"hint": puzzle.get("hint", "No hint available."), "cost": 15}


# ------------------- Player Progress -------------------
@api_router.get("/player/{player_id}")
async def get_player(player_id: str):
    doc = await db.players.find_one({"player_id": player_id}, {"_id": 0})
    if not doc:
        progress = PlayerProgress(player_id=player_id)
        await db.players.insert_one(progress.model_dump())
        return progress.model_dump()
    return doc


@api_router.post("/player")
async def create_or_update_player(progress: PlayerProgress):
    doc = progress.model_dump()
    await db.players.update_one(
        {"player_id": progress.player_id},
        {"$set": doc},
        upsert=True,
    )
    return doc


@api_router.post("/progress")
async def update_progress(payload: ProgressUpdate):
    player = await db.players.find_one({"player_id": payload.player_id}, {"_id": 0})
    if not player:
        player = PlayerProgress(player_id=payload.player_id).model_dump()

    if payload.completed and payload.level not in player.get("levels_completed", []):
        player.setdefault("levels_completed", []).append(payload.level)

    player["coins"] = player.get("coins", 0) + payload.coins
    if payload.stars > 0:
        stars_map = player.get("level_stars", {})
        prev = stars_map.get(str(payload.level), 0)
        stars_map[str(payload.level)] = max(prev, payload.stars)
        player["level_stars"] = stars_map

    await db.players.update_one(
        {"player_id": payload.player_id},
        {"$set": player},
        upsert=True,
    )
    return player


# ------------------- Mock Shop -------------------
@api_router.get("/shop/packs")
async def get_shop_packs():
    return {
        "packs": [
            {
                "id": "coin-small",
                "name": "Pouch of Coins",
                "coins": 250,
                "gems": 0,
                "price": "$0.99",
                "color": "#FBBF24",
                "popular": False,
            },
            {
                "id": "coin-medium",
                "name": "Chest of Coins",
                "coins": 750,
                "gems": 3,
                "price": "$2.99",
                "color": "#FB923C",
                "popular": True,
            },
            {
                "id": "coin-large",
                "name": "Treasure Hoard",
                "coins": 2000,
                "gems": 10,
                "price": "$6.99",
                "color": "#F472B6",
                "popular": False,
            },
            {
                "id": "gem-pack",
                "name": "Sparkling Gems",
                "coins": 0,
                "gems": 25,
                "price": "$4.99",
                "color": "#A78BFA",
                "popular": False,
            },
            {
                "id": "explorer-bundle",
                "name": "Explorer Bundle",
                "coins": 1500,
                "gems": 15,
                "price": "$9.99",
                "color": "#38BDF8",
                "popular": False,
            },
        ]
    }


@api_router.post("/shop/purchase")
async def purchase_pack(payload: ShopPurchaseRequest):
    packs_response = await get_shop_packs()
    pack = next(
        (p for p in packs_response["packs"] if p["id"] == payload.pack_id), None
    )
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")

    player = await db.players.find_one({"player_id": payload.player_id}, {"_id": 0})
    if not player:
        player = PlayerProgress(player_id=payload.player_id).model_dump()

    player["coins"] = player.get("coins", 0) + pack["coins"]
    player["gems"] = player.get("gems", 0) + pack["gems"]

    await db.players.update_one(
        {"player_id": payload.player_id},
        {"$set": player},
        upsert=True,
    )

    return {
        "success": True,
        "message": f"(Mock) Successfully purchased {pack['name']}!",
        "pack": pack,
        "player": player,
    }


# ------------------- AI Riddle Generator -------------------
@api_router.post("/ai/riddle")
async def generate_ai_riddle(payload: AIRiddleRequest):
    """Generate a dynamic riddle using Claude Sonnet 4.5 via Emergent LLM key."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        system_msg = (
            "You are a creative riddle and brain-teaser generator for a family-friendly "
            "educational adventure game called Strayz. Generate engaging, age-appropriate "
            "puzzles. ALWAYS respond with ONLY a valid JSON object (no markdown, no code fences) "
            "in this exact format: "
            '{"question": "...", "options": ["A","B","C","D"], "answer": "exact one of the options", '
            '"hint": "...", "explanation": "..."}'
        )

        difficulty_desc = {
            "easy": "very simple, suitable for kids 8+",
            "medium": "moderately challenging, for ages 12+",
            "hard": "tricky and clever, requires careful thought",
        }.get(payload.difficulty, "moderately challenging")

        prompt = (
            f"Generate ONE unique {difficulty_desc} {payload.category} riddle or trivia "
            "question with 4 multiple-choice options. Make it fun and educational. "
            "Return JSON ONLY."
        )

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"strayz-riddle-{uuid.uuid4()}",
            system_message=system_msg,
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")

        response = await chat.send_message(UserMessage(text=prompt))

        text = response.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.lower().startswith("json"):
                text = text[4:]
            text = text.strip()

        data = json.loads(text)

        riddle_id = f"ai-{uuid.uuid4()}"
        new_puzzle = {
            "id": riddle_id,
            "level": 0,
            "type": "trivia",
            "category": payload.category,
            "question": data.get("question", ""),
            "options": data.get("options", []),
            "answer": data.get("answer", ""),
            "hint": data.get("hint", "Think carefully!"),
            "explanation": data.get("explanation", ""),
        }
        _PUZZLE_CACHE.append(new_puzzle)

        return {
            "id": riddle_id,
            "type": "trivia",
            "category": payload.category,
            "question": new_puzzle["question"],
            "options": new_puzzle["options"],
        }

    except Exception as e:
        logging.exception("AI riddle generation failed")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")


# ------------------- AI Portrait Generator -------------------
@api_router.post("/portrait/generate")
async def generate_portrait(payload: PortraitGenRequest):
    """Generate a custom character portrait using Gemini Nano Banana."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    try:
        import base64
        from emergentintegrations.llm.chat import LlmChat, UserMessage

        style_suffix = (
            " Hand-drawn cartoon adventure game portrait, square framing, "
            "Pixar-meets-comic-book style, bold outlines, cel-shaded, vibrant "
            "colors, expressive eyes, soft warm lighting, plain pastel "
            "background. Centered headshot, no text or watermarks."
        )

        full_prompt = (payload.description or "A cheerful adventurer") + style_suffix

        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"strayz-portrait-{payload.character_id}-{uuid.uuid4()}",
            system_message=(
                "You are an expert family-friendly character illustrator. Output ONE "
                "centered cartoon portrait. Do not include text in the image."
            ),
        )
        chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
            modalities=["image", "text"]
        )

        _text, images = await chat.send_message_multimodal_response(
            UserMessage(text=full_prompt)
        )
        if not images:
            raise HTTPException(status_code=500, detail="No image returned")
        img = images[0]
        data_url = f"data:image/png;base64,{img['data']}"
        return {"image": data_url, "character_id": payload.character_id}
    except HTTPException:
        raise
    except Exception as e:
        logging.exception("Portrait generation failed")
        raise HTTPException(
            status_code=500, detail=f"Portrait generation failed: {str(e)}"
        )


# ------------------- Leaderboard -------------------
@api_router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Top players by coins (desc)."""
    cursor = db.players.find({}, {"_id": 0}).sort("coins", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    rows = []
    for d in docs:
        stars = sum((d.get("level_stars") or {}).values())
        rows.append(
            {
                "player_id": d.get("player_id", ""),
                "name": d.get("name", "Adventurer"),
                "coins": d.get("coins", 0),
                "stars": stars,
                "levels_completed": len(d.get("levels_completed") or []),
                "selected_character": d.get("selected_character", "chris"),
            }
        )
    return {"rows": rows}


import hashlib


def _seed_for_today(date_str: str, key: str) -> int:
    h = hashlib.sha256(f"{date_str}::{key}".encode()).hexdigest()
    return int(h[:8], 16)


@api_router.get("/daily-challenge")
async def get_daily_challenge():
    """One puzzle per character specialty, deterministic for today's date."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    specialty_categories = {
        "chris": ["math", "logic"],
        "archie": ["music"],
        "lynn": ["history", "geography"],
        "deb": ["science", "nature"],
        "dolly": ["history", "geography", "music", "logic"],
        "arthur": ["sports"],
    }
    picks = []
    for char_id, cats in specialty_categories.items():
        candidates = [
            p
            for p in _PUZZLE_CACHE
            if p.get("category") in cats and p.get("type") != "pattern"
        ]
        if not candidates:
            continue
        idx = _seed_for_today(today, char_id) % len(candidates)
        p = candidates[idx]
        picks.append(
            {
                "character_id": char_id,
                "puzzle": {
                    "id": p["id"],
                    "type": p["type"],
                    "category": p["category"],
                    "question": p["question"],
                    "options": p.get("options"),
                },
            }
        )
    return {"date": today, "challenges": picks}


# ------------------- Wire-up -------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
