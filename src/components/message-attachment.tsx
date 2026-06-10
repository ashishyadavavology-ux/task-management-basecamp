import { FileText, Download } from "lucide-react";
import type { Message } from "@/lib/types";

export function MessageAttachment({ message }: { message: Message }) {
  if (!message.attachmentUrl || !message.attachmentType) return null;

  if (message.attachmentType === "image") {
    return (
      <a href={message.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block">
        <img
          src={message.attachmentUrl}
          alt={message.attachmentName || "Image"}
          className="max-h-48 max-w-full rounded-xl border object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={message.attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex items-center gap-2 rounded-xl border bg-background/50 px-3 py-2 text-sm hover:bg-background"
    >
      <FileText className="h-4 w-4 shrink-0 text-destructive" />
      <span className="truncate">{message.attachmentName || "Document.pdf"}</span>
      <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
    </a>
  );
}
