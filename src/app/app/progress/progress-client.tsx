"use client";

import { useEffect, useMemo, useState } from "react";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";
import { motion } from "framer-motion";

type Task = {
  id: string;
  title: string;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

export default function ProgressClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tasks", { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as
        | { tasks?: Task[]; error?: string }
        | null;

      if (!res.ok) {
        setError(body?.error ?? "failed");
        setLoading(false);
        return;
      }

      setTasks(body?.tasks ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completedAt).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);

    const byDay = new Map<string, { total: number; done: number }>();

    for (const t of tasks) {
      const d = t.dueAt ? new Date(t.dueAt) : new Date(t.createdAt);
      const key = d.toISOString().slice(0, 10);
      const cur = byDay.get(key) ?? { total: 0, done: 0 };
      cur.total += 1;
      if (t.completedAt) cur.done += 1;
      byDay.set(key, cur);
    }

    const days = Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7);

    return { total, done, pct, last7: days };
  }, [tasks]);

  return (
    <PageTransition>
      <ModulePage
        moduleKey="progress"
        title="Progress"
        subtitle="Calculated from your tasks. Complete tasks → progress increases."
      >
        {/* CONTENT CONTAINER */}
        <div className="w-full max-w-5xl mx-auto space-y-6">

          {/* GRID */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">

            {/* OVERALL */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-[1.5rem] bg-[#2C1A10] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]"
            >
              <div className="text-sm font-semibold">Overall</div>

              {loading ? (
                <div className="mt-3 text-sm text-white/60">Loading…</div>
              ) : error ? (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : (
                <>
                  <div className="mt-3 text-5xl font-semibold tracking-tight">
                    {stats.pct}%
                  </div>

                  <div className="mt-2 text-sm text-white/70">
                    Done <span className="text-white">{stats.done}</span> of{" "}
                    {stats.total} tasks
                  </div>

                  <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${stats.pct}%`,
                        background:
                          "linear-gradient(90deg, #ff7e5f, #feb47b, #ffd86f)",
                      }}
                    />
                  </div>
                </>
              )}
            </motion.div>

            {/* LAST 7 DAYS */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-[1.5rem] bg-[#2C1A10] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]"
            >
              <div className="text-sm font-semibold">Last 7 days</div>

              <div className="mt-4 space-y-3">
                {stats.last7.length === 0 ? (
                  <div className="text-sm text-white/60">No data yet.</div>
                ) : (
                  stats.last7.map(([date, v]) => {
                    const pct =
                      v.total === 0
                        ? 0
                        : Math.round((v.done / v.total) * 100);

                    return (
                      <div
                        key={date}
                        className="rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{date}</div>
                          <div className="text-xs text-white/70">
                            {v.done}/{v.total} ({pct}%)
                          </div>
                        </div>

                        <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background:
                                "linear-gradient(90deg, #ff7e5f, #feb47b, #ffd86f)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* COMPLETED TASKS */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-[1.5rem] bg-[#2C1A10] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]"
          >
            <div className="text-sm font-semibold">
              Completed tasks (highlighted)
            </div>

            <div className="mt-4 space-y-3">
              {tasks.filter((t) => t.completedAt).length === 0 ? (
                <div className="text-sm text-white/60">
                  No completed tasks yet.
                </div>
              ) : (
                tasks
                  .filter((t) => t.completedAt)
                  .map((t) => (
                    <motion.div
                      key={t.id}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-xl px-4 py-3 text-sm text-white bg-gradient-to-r from-[#ff7e5f]/30 to-[#ffd86f]/30 border border-white/10"
                    >
                      {t.title}
                    </motion.div>
                  ))
              )}
            </div>
          </motion.div>

        </div>
      </ModulePage>
    </PageTransition>
  );
}