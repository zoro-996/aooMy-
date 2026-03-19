"use client";

import { useEffect, useRef, useState } from "react";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";
import { cn } from "@/lib/cn";
import { cssVar } from "@/lib/css";
import { motion } from "framer-motion";

type ChatMsg = { role: "user" | "assistant"; content: string };

export default function ChatClient() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Ask anything about your uploaded files, notes, and tasks. I’ll answer using your data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    setSending(true);
    setInput("");

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: next }),
    });

    const body = (await res.json().catch(() => null)) as
      | { reply?: string; error?: string; hint?: string }
      | null;

    setSending(false);

    if (!res.ok) {
      setError(body?.hint ?? body?.error ?? "Chat failed.");
      return;
    }

    setMessages([...next, { role: "assistant", content: body?.reply ?? "" }]);
  }

  return (
    <PageTransition>
      <ModulePage
        moduleKey="chat"
        title="AI Chat"
        subtitle="Uses your uploaded files + diary notes as context (local retrieval)."
      >
        {/* 🔥 MAIN CONTAINER */}
        <div className="w-full max-w-5xl mx-auto px-4 py-6">

          {/* GLASS CONTAINER */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[2rem] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 flex flex-col min-h-[70vh]"
          >

            {/* INNER CHAT PANEL */}
            <div className="bg-[#0F172A] rounded-[1.5rem] p-6 flex flex-col flex-1 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]">

              {/* CHAT AREA */}
              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "flex",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3 backdrop-blur-md",
                        m.role === "assistant"
                          ? "bg-white/5 border border-white/10 text-white"
                          : "bg-gradient-to-br from-cyan-400/30 to-blue-500/30 text-white shadow-lg"
                      )}
                    >
                      <div className="text-[11px] text-white/50 mb-1">
                        {m.role === "assistant" ? "AI Chat" : "You"}
                      </div>
                      <div className="text-sm leading-6 whitespace-pre-wrap">
                        {m.content}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {sending && (
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-white">
                      <div className="text-[11px] text-white/50 mb-1">
                        AI Chat
                      </div>
                      <div className="text-sm text-white/70 animate-pulse">
                        Thinking…
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* INPUT */}
              <div className="mt-4 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void send();
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl bg-white/5 px-4 py-3 outline-none text-white ring-1 ring-white/10 focus:ring-2 transition"
                  style={cssVar("--tw-ring-color", "rgba(0,255,255,0.6)")}
                />

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => void send()}
                  disabled={sending}
                  className="rounded-xl px-4 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white"
                >
                  Send
                </motion.button>
              </div>

            </div>
          </motion.div>
        </div>
      </ModulePage>
    </PageTransition>
  );
}