import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Sparkles, RotateCcw, Save } from "lucide-react";
import TactileButton from "@/components/TactileButton";
import { CHARACTERS } from "@/data/storyData";
import {
  getPortraitOverride,
  setPortraitOverride,
  resolveCharacterImage,
} from "@/lib/portraits";
import { earn } from "@/lib/achievements";
import client from "@/lib/api";

export default function PortraitEditor({ open, onOpenChange, characterId, onSaved }) {
  const character = CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];
  const [preview, setPreview] = useState(resolveCharacterImage(character));
  const [aiPrompt, setAiPrompt] = useState("");
  const [busy, setBusy] = useState(false);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please pick an image file.");
      return;
    }
    if (f.size > 2.5 * 1024 * 1024) {
      toast.error("Image too large (max 2.5 MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const generateAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Type a description first!");
      return;
    }
    setBusy(true);
    try {
      const res = await client.post("/portrait/generate", {
        character_id: characterId,
        description: aiPrompt.trim(),
      });
      setPreview(res.data.image);
      toast.success("AI portrait ready! Click Save to apply.");
    } catch {
      toast.error("Generation failed — try a different prompt.");
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    if (preview && preview !== character.image) {
      setPortraitOverride(characterId, preview);
      earn("custom-portrait");
      toast.success(`${character.name}'s portrait updated!`);
    }
    onSaved?.(preview);
    onOpenChange(false);
  };

  const reset = () => {
    setPortraitOverride(characterId, null);
    setPreview(character.image);
    toast(`${character.name} reset to original portrait.`);
    onSaved?.(character.image);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-amber-50 border-4 border-slate-800 rounded-3xl max-w-md"
        data-testid="portrait-editor"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Edit {character.name}'s Portrait
          </DialogTitle>
          <DialogDescription>
            Upload your own photo or generate a fresh portrait with AI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center">
            <img
              src={preview}
              alt={character.name}
              className="w-32 h-32 rounded-2xl border-4 border-slate-800 object-cover tactile-shadow"
              style={{ backgroundColor: character.color + "30" }}
              data-testid="portrait-preview"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <Upload className="w-4 h-4" strokeWidth={3} />
              Upload your own
            </Label>
            <Input
              type="file"
              accept="image/*"
              onChange={onFile}
              className="border-2 border-slate-800 rounded-xl"
              data-testid="portrait-file-input"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" strokeWidth={3} />
              Or describe a new look (AI)
            </Label>
            <Input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. a smiling explorer with red hair and freckles"
              className="border-2 border-slate-800 rounded-xl"
              data-testid="portrait-ai-prompt"
            />
            <TactileButton
              color="#A78BFA"
              size="sm"
              icon={Sparkles}
              onClick={generateAI}
              disabled={busy}
              className="w-full"
              data-testid="portrait-generate-button"
            >
              {busy ? "Generating…" : "Generate with AI"}
            </TactileButton>
          </div>

          <div className="flex gap-2 pt-1">
            <TactileButton
              color="#FFFFFF"
              textColor="#1E293B"
              size="sm"
              icon={RotateCcw}
              onClick={reset}
              data-testid="portrait-reset-button"
            >
              Reset
            </TactileButton>
            <TactileButton
              color="#4ADE80"
              size="sm"
              icon={Save}
              onClick={save}
              className="flex-1"
              data-testid="portrait-save-button"
            >
              Save Portrait
            </TactileButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
