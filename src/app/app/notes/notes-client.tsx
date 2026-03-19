"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";
import { cssVar } from "@/lib/css";
import { motion } from "framer-motion";

type Note = {
  id: string;
  date: string;
  title: string | null;
  content: string;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NotesClient() {
  const search = useSearchParams();
  const selectedDate = search.get("date") ?? todayISO();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerSubtitle = useMemo(
    () => `Diary note for ${selectedDate}. (Calendar opens this page by date.)`,
    [selectedDate]
  );

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/notes?date=${encodeURIComponent(selectedDate)}`, {
        cache: "no-store",
      });

      const body = (await res.json().catch(() => null)) as {
        note?: Note | null;
        error?: string;
      } | null;

      if (!res.ok) {
        setError(body?.error ?? "failed");
        setLoading(false);
        return;
      }

      setTitle(body?.note?.title ?? "");
      setContent(body?.note?.content ?? "");
      setLoading(false);
    })();
  }, [selectedDate]);

  async function save() {
    setSaving(true);
    setError(null);

    const res = await fetch("/api/notes", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        date: selectedDate,
        title: title.trim() ? title.trim() : undefined,
        content,
      }),
    });

    if (!res.ok) {
      setError("Could not save note.");
      setSaving(false);
      return;
    }

    setSaving(false);
  }

  return (
    <PageTransition>
      <ModulePage
        moduleKey="notes"
        title="Notes (Diary)"
        subtitle={headerSubtitle}
      >
        {/* CENTER CONTAINER */}
        <div className="w-full max-w-4xl mx-auto">

          {/* GLASS CARD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.01 }}
            className="rounded-[2rem] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8"
          >
            {/* INNER PANEL */}
            <div className="bg-[#2C1A10] rounded-[1.5rem] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]">

              {/* HEADER */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-semibold">Editor</div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => void save()}
                  disabled={saving || loading}
                  className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white"
                >
                  {saving ? "Saving…" : "Save"}
                </motion.button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-5 grid gap-4">

                {/* TITLE */}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title (optional)…"
                  className="w-full rounded-xl bg-white/5 px-4 py-3 outline-none text-white ring-1 ring-white/10 focus:ring-2 backdrop-blur-md"
                  style={cssVar("--tw-ring-color", "rgba(255,180,100,0.6)")}
                  disabled={loading}
                />

                {/* CONTENT */}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={loading ? "Loading…" : "Write your diary note..."}
                  className="min-h-[280px] w-full resize-y rounded-xl bg-white/5 px-4 py-3 outline-none text-white ring-1 ring-white/10 focus:ring-2 backdrop-blur-md"
                  style={cssVar("--tw-ring-color", "rgba(255,180,100,0.6)")}
                  disabled={loading}
                />
              </div>

            </div>
          </motion.div>
        </div>
      </ModulePage>
    </PageTransition>
  );
}