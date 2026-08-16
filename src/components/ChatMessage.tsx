import { Bot } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(93,235,235,0.16)] bg-[rgba(93,235,235,0.08)] text-[#5DEBEB]">
          <Bot className="h-4 w-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-[0_0_18px_rgba(60,220,220,0.06)] sm:text-[15px] ${
          isUser
            ? "border-[rgba(93,235,235,0.18)] bg-[rgba(21,61,66,0.9)] text-[#F4FFFF]"
            : "border-[rgba(90,220,220,0.12)] bg-[#153D42] text-[#F4FFFF]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
