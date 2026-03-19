"use client";

import { modules, type ModuleKey } from "@/lib/modules";
import { cssVar } from "@/lib/css";
import { motion } from "framer-motion";
import React from "react";

export function ModulePage({
  moduleKey,
  title,
  subtitle,
  children,
}: {
  moduleKey: ModuleKey;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const mod = modules.find((m) => m.key === moduleKey);

  const bgMap: Record<string, string> = {
    tasks: "bg-gradient-to-br from-[#87CEEB] to-[#98FB98]",
    calendar: "bg-gradient-to-br from-[#7851A9] to-[#FF1493]",
    chat: "bg-gradient-to-br from-[#6F00FF] to-[#00FFFF]",
    progress: "bg-gradient-to-br from-[#ff7e5f] via-[#feb47b] to-[#ffd86f]",
    files: "bg-gradient-to-br from-[#50C878] to-[#008080]",
    archive: "bg-gradient-to-br from-[#708090] to-[#C0C0C0]",
  };

  const innerMap: Record<string, string> = {
    tasks: "bg-[#1A2238]",
    calendar: "bg-[#2D1B33]",
    chat: "bg-[#0F172A]",
    progress: "bg-[#2C1A10]",
    files: "bg-[#12221A]",
    archive: "bg-[#1F2937]",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`relative min-h-screen w-full flex flex-col items-center overflow-hidden ${
        bgMap[moduleKey] ?? ""
      }`}
      style={
        mod ? cssVar("--module", `var(${mod.color.rgbVar})`) : undefined
      }
    >
      {/* 🔥 FLOATING BACKGROUND GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-[400px] h-[400px] bg-white/10 blur-3xl rounded-full absolute top-20 left-20"
        />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            scale: 1.02,
            boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
          }}
          transition={{ type: "spring", stiffness: 200 }}
          className={`rounded-3xl backdrop-blur-2xl border border-white/10 p-6 md:p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${
            innerMap[moduleKey] ?? ""
          }`}
        >
          <div className="flex items-start justify-between gap-4">

            {/* TITLE */}
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {title}
              </h1>

              {subtitle && (
                <p className="mt-2 text-sm text-white/70">
                  {subtitle}
                </p>
              )}
            </div>

            {/* ICON */}
            {mod && (
              <motion.div
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background:
                    "radial-gradient(70% 70% at 30% 30%, rgb(var(--module) / 0.55), rgba(255,255,255,0.08))",
                }}
              >
                <mod.icon className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "50%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgb(var(--module) / 0.95), rgb(var(--module) / 0.2))",
              }}
            />
          </div>
        </motion.div>

        {/* CONTENT */}
        <motion.div
          className="mt-8 space-y-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {React.Children.map(children, (child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.3 }}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}