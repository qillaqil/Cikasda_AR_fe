"use client";

import { Bot, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import QuickQuestions from "./QuickQuestions";

interface ChatMessageData {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_API_URL = "/api/chat"; // Menggunakan Next.js API Route lokal

const quickQuestions = [
  "Apa fungsi bangunan ini?",
  "Kapan proyek ini dibuat?",
  "Di mana lokasi Masjid Raya Baitul Khairaat?",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessageData[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! Ada yang ingin Anda ketahui tentang Masjid Raya Baitul Khairaat?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const visibleMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [visibleMessages, isLoading]);

  const handleSend = async (question?: string) => {
    const text = (question ?? input).trim();
    if (!text) return;

    const userMessage: ChatMessageData = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const assistantResponse = data.response || "Maaf, terjadi kesalahan saat memproses permintaan Anda.";

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantResponse,
        },
      ]);
    } catch (error) {
      console.error("Error sending message to backend:", error);
      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Maaf, terjadi kesalahan saat menghubungi asisten AI.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-[rgba(90,220,220,0.12)] bg-[linear-gradient(145deg,#092A30_0%,#0B3035_100%)] p-4 shadow-[0_0_30px_rgba(60,220,220,0.05)] backdrop-blur-sm sm:p-5 lg:p-6">
      <div className="mb-4 flex items-center gap-2 text-[#F4FFFF]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(93,235,235,0.2)] bg-[rgba(93,235,235,0.08)] text-[#5DEBEB]">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F4FFFF]">
          AI Assistant
        </h3>
      </div>

      <div
        ref={listRef}
        className="max-h-[300px] space-y-3 overflow-y-auto pr-1"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl border border-[rgba(93,235,235,0.12)] bg-[rgba(21,61,66,0.75)] px-4 py-3 text-sm text-[#F4FFFF]">
              <Bot className="h-4 w-4 text-[#5DEBEB]" />
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5DEBEB]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5DEBEB] [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5DEBEB] [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <QuickQuestions items={quickQuestions} onSelect={handleSend} />
      </div>

      <form
        className="mt-4 flex gap-2 rounded-2xl border border-white/10 bg-transparent p-2"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ketik pertanyaan Anda..."
          className="h-12 w-full rounded-xl border border-[rgba(90,220,220,0.16)] bg-[rgba(5,20,25,0.8)] px-4 text-sm text-[#F4FFFF] placeholder:text-[#A9C4C7]/70 outline-none transition focus:border-[rgba(93,235,235,0.36)] focus:shadow-[0_0_15px_rgba(93,235,235,0.15)]"
          aria-label="Ketik pertanyaan Anda"
        />
        <button
          type="submit"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5DEBEB] text-[#061419] transition hover:bg-[#69E8E8] hover:shadow-[0_0_18px_rgba(93,235,235,0.25)]"
          aria-label="Kirim pesan"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
