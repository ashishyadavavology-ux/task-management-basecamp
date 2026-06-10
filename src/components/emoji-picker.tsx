import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

const EMOJIS = [
  "😀", "😂", "😊", "😍", "🥰", "😎", "🤔", "👍", "👎", "👏",
  "🙌", "🎉", "🔥", "❤️", "💯", "✅", "❌", "⭐", "🚀", "💡",
  "📌", "📎", "📅", "⏰", "☕", "🙏", "💪", "😅", "🤝", "👀",
];

export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="grid grid-cols-6 gap-1">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="rounded-md p-1.5 text-lg hover:bg-muted"
              onClick={() => onPick(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
