"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

const modules = [
  {
    href: "/app/tasks",
    label: "Daily Tasks",
    icon: "✅",
    gradient: "from-[#87CEEB] to-[#98FB98]",
  },
  {
    href: "/app/calendar",
    label: "Calendar",
    icon: "📅",
    gradient: "from-[#7851A9] to-[#FF1493]",
  },
  {
    href: "/app/chat",
    label: "AI Chat",
    icon: "💬",
    gradient: "from-[#6F00FF] to-[#00FFFF]",
  },
  {
    href: "/app/progress",
    label: "Progress",
    icon: "📈",
    gradient: "from-[#ff7e5f] to-[#ffd86f]",
  },
  {
    href: "/app/files",
    label: "Data Files",
    icon: "📂",
    gradient: "from-[#50C878] to-[#008080]",
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useSession();
  const [showProfile, setShowProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1c2c] relative overflow-hidden">

      {/* 🔥 BACKGROUND GLOW (NEXT LEVEL) */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="w-[400px] h-[400px] bg-white/10 blur-3xl rounded-full absolute top-10 left-10"
          animate={{
            x: [0, 100, -100, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* MAIN PANEL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-[95%] max-w-7xl rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 relative z-10"
      >

        {/* HAMBURGER */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/app/archive")}
          className="absolute top-6 left-6 h-12 w-12 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20"
        >
          <span className="block h-[2px] w-6 bg-black rounded-full"></span>
          <span className="block h-[2px] w-6 bg-black rounded-full"></span>
          <span className="block h-[2px] w-6 bg-black rounded-full"></span>
        </motion.button>

        {/* PROFILE */}
        <div className="absolute top-6 right-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowProfile((v) => !v)}
            className="h-14 w-14 rounded-full flex items-center justify-center overflow-hidden
            bg-gradient-to-tr from-pink-500 to-red-500 p-[2px]"
          >
            <div className="h-full w-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} className="h-full w-full object-cover" />
              ) : (
                <span className="text-white text-lg font-semibold">
                  {(data?.user?.name ?? data?.user?.email ?? "?")
                    .toString()
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>
          </motion.button>

          {showProfile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-3 w-60 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 p-4 text-white text-xs space-y-3"
            >
              <div>
                <div className="font-semibold">User</div>
                <div className="text-white/70">
                  {data?.user?.name ?? "Not set"}
                </div>
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-white/70">
                  {data?.user?.email ?? "Unknown"}
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="text-[10px]"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setAvatarUrl(URL.createObjectURL(file));
                }}
              />
            </motion.div>
          )}
        </div>

        {/* MODULE BUTTONS */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 py-12"
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
          {modules.map((mod) => {
            const active =
              pathname === mod.href ||
              pathname?.startsWith(mod.href + "/");

            return (
              <motion.div
                key={mod.href}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Link
                  href={mod.href}
                  className={cn(
                    "w-[160px] h-[180px] rounded-[2rem] flex flex-col items-center justify-center text-white text-center",
                    "bg-gradient-to-br",
                    mod.gradient,
                    "shadow-[0_10px_40px_rgba(0,0,0,0.5)]",
                    "transition-all duration-300",
                    active && "scale-105 ring-2 ring-white/40"
                  )}
                >
                  <div className="text-4xl mb-3">{mod.icon}</div>
                  <div className="text-sm font-semibold tracking-wide">
                    {mod.label}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* LOGOUT */}
        <div className="absolute bottom-6 left-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-5 py-3 rounded-xl bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30"
          >
            Logout
          </motion.button>
        </div>

        {/* CHILD CONTENT */}
        <div className="mt-10">{children}</div>
      </motion.div>
    </div>
  );
}