"use client";

import { useEffect, useMemo, useState } from "react";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";
import { cn } from "@/lib/cn";
import { Plus, Trash2 } from "lucide-react";
import { cssVar } from "@/lib/css";
import { motion } from "framer-motion";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function isoTodayLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TasksClient() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function refresh(opts?: { showLoading?: boolean }) {
    if (opts?.showLoading) setLoading(true);
    setError(null);
    const res = await fetch("/api/tasks", { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as { tasks?: Task[]; error?: string } | null;
    if (!res.ok) {
      setError(body?.error ?? "failed");
      setLoading(false);
      return;
    }
    setTasks(body?.tasks ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completedAt).length;
    const todayStart = isoTodayLocal().getTime();
    const todayEnd = todayStart + 24 * 60 * 60 * 1000;

    const today = tasks.filter((t) => {
      if (!t.dueAt) return false;
      const ms = new Date(t.dueAt).getTime();
      return ms >= todayStart && ms < todayEnd;
    });

    const todayDone = today.filter((t) => t.completedAt).length;

    return { total, done, todayCount: today.length, todayDone };
  }, [tasks]);

  async function createTask() {
    const trimmed = title.trim();
    if (!trimmed) return;

    setError(null);
    setTitle("");

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: trimmed }),
    });

    if (!res.ok) {
      setError("Could not create task.");
      return;
    }

    await refresh({ showLoading: true });
  }

  async function toggleComplete(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ completed: !task.completedAt }),
    });

    if (!res.ok) {
      setError("Could not update task.");
      return;
    }

    await refresh({ showLoading: true });
  }

  async function removeTask(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });

    if (!res.ok) {
      setError("Could not delete task.");
      return;
    }

    await refresh({ showLoading: true });
  }

  return (
    <PageTransition>
      <ModulePage
        moduleKey="tasks"
        title="Daily Tasks"
        subtitle="Create tasks, mark them complete, and Progress updates automatically."
      >
        <div className="bg-daily-tasks w-full min-h-screen flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
          
          <div className="w-full max-w-5xl mx-auto">
            
            {/* GLASS */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-[2rem] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8"
            >
              
              {/* GRID */}
              <div className="grid gap-6 grid-cols-1 md:grid-cols-[1.3fr_0.7fr]">
                
                {/* TASKS */}
                <div className="rounded-[1.5rem] bg-[#1A2238] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]">
                  
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm font-semibold">Your tasks</div>

                    <div className="flex gap-2">
                      <div className="rounded-xl bg-white/5 px-3 py-1 text-xs text-white/70">
                        Done: <span className="text-white">{stats.done}</span> / {stats.total}
                      </div>
                      <div className="rounded-xl bg-white/5 px-3 py-1 text-xs text-white/70">
                        Today: <span className="text-white">{stats.todayDone}</span> / {stats.todayCount}
                      </div>
                    </div>
                  </div>

                  {/* INPUT */}
                  <div className="mt-4 flex gap-2">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Add a task…"
                      className="flex-1 rounded-xl bg-white/5 px-4 py-3 outline-none text-white ring-1 ring-white/10 focus:ring-2"
                      style={cssVar("--tw-ring-color", "rgba(132,250,176,0.6)")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void createTask();
                      }}
                    />

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => void createTask()}
                      className="rounded-xl px-4 py-3 text-sm bg-white/10 hover:bg-white/20 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </motion.button>
                  </div>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  {/* LIST */}
                  <div className="mt-4 space-y-2">
                    {loading ? (
                      <div className="text-sm text-white/60">Loading…</div>
                    ) : tasks.length === 0 ? (
                      <div className="text-sm text-white/60">No tasks yet.</div>
                    ) : (
                      tasks.map((t) => {
                        const done = !!t.completedAt;

                        return (
                          <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-3"
                          >
                            <button
                              onClick={() => void toggleComplete(t)}
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold",
                                done
                                  ? "bg-green-500 text-white"
                                  : "bg-white/10 hover:bg-white/20"
                              )}
                            >
                              {done ? "Done" : "Do"}
                            </button>

                            <div className="flex-1">
                              <div className={cn("text-sm font-semibold", done && "line-through text-white/60")}>
                                {t.title}
                              </div>
                            </div>

                            <button
                              onClick={() => void removeTask(t)}
                              className="h-9 w-9 grid place-items-center rounded-xl bg-white/5 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4 text-white/70" />
                            </button>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* SIDE PANEL */}
                <div className="rounded-[1.5rem] bg-[#1A2238] p-6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]">
                  <div className="text-sm font-semibold">Progress</div>

                  <div className="mt-3 text-3xl font-semibold">
                    {stats.total === 0 ? "0%" : Math.round((stats.done / stats.total) * 100) + "%"}
                  </div>

                  <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: stats.total === 0 ? "0%" : `${Math.round((stats.done / stats.total) * 100)}%`,
                        background: "linear-gradient(90deg,#8fd3f4,#84fab0,#a6ffcb)",
                      }}
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      </ModulePage>
    </PageTransition>
  );
}