"""Strayz backend pytest suite covering all /api endpoints."""
import os
import json
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://trivia-tomb-explorer.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def player_id():
    return f"TEST_player_{uuid.uuid4().hex[:8]}"


# -------- Root / Levels --------
class TestRootAndLevels:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("game") == "Strayz"

    def test_levels(self, session):
        r = session.get(f"{API}/levels")
        assert r.status_code == 200
        data = r.json()
        assert "levels" in data
        levels = data["levels"]
        assert len(levels) == 6
        keys = {"id", "name", "subject", "color", "icon", "description", "background"}
        for lvl in levels:
            assert keys.issubset(lvl.keys()), f"Missing keys in {lvl}"


# -------- Puzzles --------
class TestPuzzles:
    @pytest.mark.parametrize("level", [1, 2, 3, 4, 5, 6])
    def test_puzzles_per_level(self, session, level):
        r = session.get(f"{API}/puzzles/{level}")
        assert r.status_code == 200
        data = r.json()
        assert data["level"] == level
        puzzles = data["puzzles"]
        assert len(puzzles) > 0
        for p in puzzles:
            assert "answer" not in p, "answer field must not leak"
            assert "id" in p and "question" in p and "type" in p
            if p["type"] == "pattern":
                assert "sequence" in p
            else:
                assert "options" in p

    def test_invalid_level(self, session):
        r = session.get(f"{API}/puzzles/99")
        assert r.status_code == 400


# -------- Answer --------
class TestAnswer:
    def test_trivia_correct(self, session):
        # trivia-2: 7,14,28,56 -> 112 (moved due to new puzzles inserted at top)
        r = session.post(f"{API}/answer", json={"puzzle_id": "trivia-2", "selected": "112", "difficulty": "medium"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["correct"] is True
        assert data["coins_earned"] == 20
        assert data["correct_answer"] == "112"

    def test_trivia_incorrect_reveals_answer(self, session):
        r = session.post(f"{API}/answer", json={"puzzle_id": "trivia-2", "selected": "72", "difficulty": "medium"})
        assert r.status_code == 200
        data = r.json()
        assert data["correct"] is False
        assert data["correct_answer"] == "112"
        assert data["coins_earned"] == 0

    def test_difficulty_reward_easy_hard(self, session):
        # trivia-3 is now the "I have cities... A map" riddle
        r1 = session.post(f"{API}/answer", json={"puzzle_id": "trivia-3", "selected": "A map", "difficulty": "easy"})
        assert r1.json()["coins_earned"] == 10
        r2 = session.post(f"{API}/answer", json={"puzzle_id": "trivia-3", "selected": "A map", "difficulty": "hard"})
        assert r2.json()["coins_earned"] == 35

    def test_pattern_correct(self, session):
        seq = ["red", "blue", "yellow", "green"]
        r = session.post(f"{API}/answer", json={"puzzle_id": "pattern-0", "selected": json.dumps(seq)})
        assert r.status_code == 200
        data = r.json()
        assert data["correct"] is True, data
        assert data["coins_earned"] > 0

    def test_pattern_incorrect(self, session):
        r = session.post(f"{API}/answer", json={"puzzle_id": "pattern-0", "selected": json.dumps(["red", "blue"])})
        assert r.json()["correct"] is False

    def test_unknown_puzzle(self, session):
        r = session.post(f"{API}/answer", json={"puzzle_id": "trivia-9999", "selected": "x"})
        assert r.status_code == 404


# -------- Hint --------
class TestHint:
    def test_hint(self, session):
        r = session.get(f"{API}/hint/trivia-0")
        assert r.status_code == 200
        data = r.json()
        assert data["cost"] == 15
        assert isinstance(data["hint"], str) and len(data["hint"]) > 0

    def test_hint_not_found(self, session):
        r = session.get(f"{API}/hint/does-not-exist")
        assert r.status_code == 404


# -------- Player --------
class TestPlayer:
    def test_auto_create_player(self, session, player_id):
        r = session.get(f"{API}/player/{player_id}")
        assert r.status_code == 200
        data = r.json()
        assert data["player_id"] == player_id
        assert data["coins"] == 100
        assert data["gems"] == 5
        assert data["levels_completed"] == []

    def test_get_player_persistence(self, session, player_id):
        r = session.get(f"{API}/player/{player_id}")
        assert r.status_code == 200
        assert "_id" not in r.json()


# -------- Progress --------
class TestProgress:
    def test_update_progress(self, session, player_id):
        # ensure player exists
        session.get(f"{API}/player/{player_id}")
        r = session.post(f"{API}/progress", json={
            "player_id": player_id, "level": 1, "completed": True, "coins": 50, "stars": 2
        })
        assert r.status_code == 200, r.text
        data = r.json()
        assert 1 in data["levels_completed"]
        assert data["coins"] >= 150
        assert data["level_stars"]["1"] == 2

        # verify via GET
        g = session.get(f"{API}/player/{player_id}").json()
        assert 1 in g["levels_completed"]
        assert g["level_stars"]["1"] == 2

    def test_progress_stars_dont_decrease(self, session, player_id):
        # Already 2 stars on level 1; submit 1, should remain 2
        r = session.post(f"{API}/progress", json={
            "player_id": player_id, "level": 1, "completed": True, "coins": 0, "stars": 1
        })
        assert r.json()["level_stars"]["1"] == 2


# -------- Shop --------
class TestShop:
    def test_packs(self, session):
        r = session.get(f"{API}/shop/packs")
        assert r.status_code == 200
        packs = r.json()["packs"]
        assert len(packs) == 5
        ids = {p["id"] for p in packs}
        assert "coin-small" in ids and "explorer-bundle" in ids

    def test_purchase_credits_player(self, session, player_id):
        before = session.get(f"{API}/player/{player_id}").json()
        r = session.post(f"{API}/shop/purchase", json={"player_id": player_id, "pack_id": "coin-medium"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        # coin-medium: +750 coins, +3 gems
        assert data["player"]["coins"] == before["coins"] + 750
        assert data["player"]["gems"] == before["gems"] + 3

    def test_purchase_invalid_pack(self, session, player_id):
        r = session.post(f"{API}/shop/purchase", json={"player_id": player_id, "pack_id": "bogus"})
        assert r.status_code == 404


# -------- AI Riddle --------
class TestAIRiddle:
    def test_generate_and_answer(self, session):
        r = session.post(f"{API}/ai/riddle", json={"category": "logic", "difficulty": "easy"}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["id"].startswith("ai-")
        assert isinstance(data["options"], list) and len(data["options"]) >= 2
        assert isinstance(data["question"], str) and len(data["question"]) > 0

        # Submit each option until one is correct (we don't know answer)
        riddle_id = data["id"]
        any_correct = False
        for opt in data["options"]:
            ans = session.post(f"{API}/answer", json={"puzzle_id": riddle_id, "selected": opt, "difficulty": "medium"})
            assert ans.status_code == 200
            j = ans.json()
            if j["correct"]:
                any_correct = True
                assert j["coins_earned"] == 20
                break
        assert any_correct, "None of the AI riddle options were marked correct - validation broken"


# -------- Daily Challenge --------
class TestDailyChallenge:
    def test_daily_challenge_shape(self, session):
        r = session.get(f"{API}/daily-challenge")
        assert r.status_code == 200, r.text
        data = r.json()
        assert "date" in data and "challenges" in data
        # YYYY-MM-DD format
        import re
        assert re.match(r"^\d{4}-\d{2}-\d{2}$", data["date"]), data["date"]
        challenges = data["challenges"]
        char_ids = [c["character_id"] for c in challenges]
        expected = {"chris", "archie", "lynn", "deb", "dolly", "arthur"}
        assert set(char_ids) == expected, f"Missing/extra characters: {char_ids}"
        for c in challenges:
            p = c["puzzle"]
            assert "id" in p and "type" in p and "category" in p and "question" in p
            assert "options" in p and isinstance(p["options"], list) and len(p["options"]) >= 2
            assert "answer" not in p

    def test_daily_challenge_deterministic_for_today(self, session):
        r1 = session.get(f"{API}/daily-challenge").json()
        r2 = session.get(f"{API}/daily-challenge").json()
        assert r1["date"] == r2["date"]
        ids1 = [c["puzzle"]["id"] for c in r1["challenges"]]
        ids2 = [c["puzzle"]["id"] for c in r2["challenges"]]
        assert ids1 == ids2, "Daily challenge must be deterministic for a given day"


# -------- Leaderboard --------
class TestLeaderboard:
    def test_leaderboard_shape_and_order(self, session):
        # Seed two players with different coins so we can verify ordering
        p1 = f"TEST_lb_{uuid.uuid4().hex[:6]}"
        p2 = f"TEST_lb_{uuid.uuid4().hex[:6]}"
        session.get(f"{API}/player/{p1}")
        session.get(f"{API}/player/{p2}")
        session.post(f"{API}/progress", json={"player_id": p1, "level": 1, "completed": True, "coins": 99999, "stars": 3})
        session.post(f"{API}/progress", json={"player_id": p2, "level": 1, "completed": True, "coins": 50000, "stars": 1})

        r = session.get(f"{API}/leaderboard", params={"limit": 5})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "rows" in data
        rows = data["rows"]
        assert isinstance(rows, list)
        assert len(rows) <= 5 and len(rows) >= 1
        # Required keys
        required = {"player_id", "name", "coins", "stars", "levels_completed", "selected_character"}
        for row in rows:
            assert required.issubset(row.keys()), f"Missing keys: {row}"
            assert "_id" not in row
            assert isinstance(row["coins"], int)
            assert isinstance(row["levels_completed"], int)
        # Order desc by coins
        coins_list = [r_["coins"] for r_ in rows]
        assert coins_list == sorted(coins_list, reverse=True), f"Not desc-ordered: {coins_list}"

    def test_leaderboard_default_limit(self, session):
        r = session.get(f"{API}/leaderboard")
        assert r.status_code == 200
        rows = r.json()["rows"]
        assert len(rows) <= 10


# -------- AI Portrait Generator (Gemini Nano Banana) --------
class TestPortraitGen:
    def test_generate_portrait_returns_png_data_url(self, session):
        r = session.post(
            f"{API}/portrait/generate",
            json={"character_id": "chris", "description": "a smiling red-haired girl with freckles"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["character_id"] == "chris"
        img = data["image"]
        assert isinstance(img, str)
        assert img.startswith("data:image/"), img[:60]
        assert ";base64," in img, img[:60]
        b64 = img.split(",", 1)[1]
        import base64 as _b64
        raw = _b64.b64decode(b64, validate=False)
        # Accept PNG OR JPEG payload (Gemini Nano Banana may return JPEG even though server labels data URL as image/png).
        is_png = raw[:8] == b"\x89PNG\r\n\x1a\n"
        is_jpeg = raw[:3] == b"\xff\xd8\xff"
        assert is_png or is_jpeg, f"Decoded bytes are not a valid PNG/JPEG image, first bytes: {raw[:8]!r}"
        assert len(raw) > 1000, "Image payload suspiciously small"


# -------- Cleanup --------
@pytest.fixture(scope="session", autouse=True)
def _cleanup(player_id):
    yield
    # Best-effort cleanup via direct mongo if available; otherwise leave.
    try:
        from pymongo import MongoClient
        mongo = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        dbn = os.environ.get("DB_NAME", "test_database")
        MongoClient(mongo)[dbn].players.delete_many({"player_id": {"$regex": "^TEST_"}})
    except Exception:
        pass
