"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

function startOfWeekSunday(d: Date) {
  const out = new Date(d);
  const day = out.getDay();
  out.setDate(out.getDate() - day);
  out.setHours(0, 0, 0, 0);
  return out;
}

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export default function CalendarClient() {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const grid = useMemo(() => {
    const start = startOfWeekSunday(startOfMonth(cursor));
    const end = endOfMonth(cursor);
    const days: Date[] = [];
    const d = new Date(start);

    while (d <= end || d.getDay() !== 0) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
      if (days.length > 42) break;
    }

    return { start, days };
  }, [cursor]);

  const monthLabel = useMemo(() => {
    return cursor.toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [cursor]);

  return (
    <PageTransition>
      <ModulePage
        moduleKey="calendar"
        title="Calendar"
        subtitle="Tap a day to open that date in Notes."
      >
        <div className="w-full flex items-center justify-center px-6 py-10">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-4xl"
          >

            {/* GLASS */}
            <div className="rounded-[2rem] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8">

              {/* INNER CARD */}
              <div className="bg-[#2D1B33] text-white rounded-[1.5rem] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)]">

                {/* HEADER */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-lg font-semibold tracking-tight">
                    {monthLabel}
                  </div>

                  <div className="flex items-center gap-2">
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCursor((c) => addMonths(c, -1))}
                      className="h-10 w-10 rounded-xl grid place-items-center bg-white/10 hover:bg-white/20"
                    >
                      ‹
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCursor(startOfMonth(new Date()))}
                      className="h-10 rounded-xl px-4 text-sm font-medium bg-white/10 hover:bg-white/20"
                    >
                      Today
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCursor((c) => addMonths(c, 1))}
                      className="h-10 w-10 rounded-xl grid place-items-center bg-white/10 hover:bg-white/20"
                    >
                      ›
                    </motion.button>
                  </div>
                </div>

                {/* WEEK DAYS */}
                <div className="mt-6 grid grid-cols-7 gap-2 text-center">
                  {weekDays.map((d) => (
                    <div key={d} className="text-xs text-white/60">
                      {d}
                    </div>
                  ))}
                </div>

                {/* GRID */}
                <motion.div
                  className="mt-3 grid grid-cols-7 gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.02,
                      },
                    },
                  }}
                >
                  {grid.days.map((d) => {
                    const inMonth = d.getMonth() === cursor.getMonth();
                    const isToday = d.getTime() === today.getTime();
                    const iso = toISODate(d);

                    return (
                      <motion.div
                        key={iso}
                        variants={{
                          hidden: { opacity: 0, scale: 0.8 },
                          visible: { opacity: 1, scale: 1 },
                        }}
                      >
                        <Link
                          href={`/app/notes?date=${encodeURIComponent(iso)}`}
                          className={cn(
                            "rounded-xl min-h-[85px] flex items-center justify-center text-lg backdrop-blur-md transition",
                            inMonth
                              ? "bg-white/5 border border-white/10"
                              : "bg-black/30",
                            isToday &&
                              "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                          )}
                        >
                          <span className="font-semibold">
                            {d.getDate()}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>

              </div>
            </div>
          </motion.div>
        </div>
      </ModulePage>
    </PageTransition>
  );
}