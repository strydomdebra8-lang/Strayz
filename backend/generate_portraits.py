"""One-shot script to generate 6 character portraits via Gemini Nano Banana.
Run: cd /app/backend && python generate_portraits.py
"""
import asyncio
import base64
import os
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv()

OUTPUT_DIR = Path("/app/frontend/public/portraits")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_KEY = os.environ["EMERGENT_LLM_KEY"]
MODEL = "gemini-3.1-flash-image-preview"

STYLE_SUFFIX = (
    "Hand-drawn cartoon adventure game portrait, headshot square framing, "
    "Pixar-meets-comic-book style, bold black outlines, cel-shaded, vibrant "
    "saturated colors, expressive eyes, soft warm lighting, plain solid pastel "
    "background, family-friendly kids-game illustration, consistent illustrated "
    "style across the whole family. Centered headshot only — no body cropping, "
    "no text, no logos, no watermark."
)

CHARACTERS = [
    {
        "id": "chris",
        "prompt": (
            "Cheerful 10-year-old boy named Chris. Light skin, messy short brown "
            "hair, big bright eyes, freckles, wearing a vivid yellow hoodie with "
            "a small math symbol pin, holding up a Rubik's cube and grinning. "
            "Mint green background. "
        ),
    },
    {
        "id": "archie",
        "prompt": (
            "Cool 16-year-old teenage boy named Archie. Light brown skin, wavy "
            "shoulder-length black hair, headphones around his neck, wearing an "
            "orange band t-shirt, holding a yellow guitar pick, smirking "
            "confidently. Warm orange background. "
        ),
    },
    {
        "id": "lynn",
        "prompt": (
            "22-year-old young woman explorer named Lynn. Tan skin, low brown "
            "ponytail, friendly hazel eyes, wearing a sky-blue safari shirt with "
            "a brass compass on a leather cord, holding a vintage parchment map. "
            "Sky-blue background. "
        ),
    },
    {
        "id": "deb",
        "prompt": (
            "28-year-old woman scientist named Deb. Olive skin, shoulder-length "
            "wavy black hair, round dark-rimmed glasses, lab coat over a purple "
            "top, holding a glowing test tube, intelligent warm smile. Soft "
            "lavender background. "
        ),
    },
    {
        "id": "dolly",
        "prompt": (
            "48-year-old kind mum named Dolly. Light skin, shoulder-length wavy "
            "auburn hair with a soft headband, warm laugh lines, pink cardigan, "
            "holding a teacup, a quiz book tucked under her arm. Soft pink "
            "background. She looks distinctly middle-aged and motherly. "
        ),
    },
    {
        "id": "arthur",
        "prompt": (
            "50-year-old fit dad sports coach named Arthur. Brown skin, short "
            "salt-and-pepper hair, slight stubble, hearty confident smile, cyan "
            "tracksuit zip jacket, silver whistle on a cord, holding a small "
            "golden trophy. Cyan background. He looks distinctly middle-aged. "
        ),
    },
]


async def generate_one(character):
    out_path = OUTPUT_DIR / f"{character['id']}.png"
    if out_path.exists():
        print(f"[skip] {character['id']} already exists")
        return character["id"], True

    prompt = character["prompt"] + STYLE_SUFFIX
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"strayz-portrait-{character['id']}",
        system_message=(
            "You are an expert character illustrator. Output ONLY one centered "
            "headshot portrait image in the requested style. Do not include any "
            "text in the image."
        ),
    )
    chat.with_model("gemini", MODEL).with_params(modalities=["image", "text"])
    try:
        _text, images = await chat.send_message_multimodal_response(
            UserMessage(text=prompt)
        )
        if not images:
            print(f"[fail] {character['id']} returned no images")
            return character["id"], False
        img = images[0]
        image_bytes = base64.b64decode(img["data"])
        with open(out_path, "wb") as f:
            f.write(image_bytes)
        print(f"[ok] {character['id']} -> {out_path} ({len(image_bytes)} bytes)")
        return character["id"], True
    except Exception as e:
        print(f"[error] {character['id']}: {e}")
        return character["id"], False


async def main():
    results = await asyncio.gather(*(generate_one(c) for c in CHARACTERS))
    ok = [cid for cid, success in results if success]
    fail = [cid for cid, success in results if not success]
    print(f"\nGenerated {len(ok)}/{len(CHARACTERS)} portraits.")
    if fail:
        print(f"Failed: {fail}")


if __name__ == "__main__":
    asyncio.run(main())
