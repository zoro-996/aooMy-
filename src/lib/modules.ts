import {
  Archive,
  Bot,
  CalendarDays,
  FileText,
  ListTodo,
  NotebookPen,
  TrendingUp,
  User,
  type LucideIcon,
} from "lucide-react";

export type ModuleKey =
  | "chat"
  | "calendar"
  | "tasks"
  | "notes"
  | "files"
  | "archive"
  | "progress"
  | "profile";

export type AppModule = {
  key: ModuleKey;
  name: string;
  href: string;
  color: { rgbVar: string; label: string };
  icon: LucideIcon;
};

export const modules: AppModule[] = [
  {
    key: "chat",
    name: "AI Chat",
    href: "/app/chat",
    color: { rgbVar: "--rgb-cyan", label: "Cyan" },
    icon: Bot,
  },
  {
    key: "calendar",
    name: "Calendar",
    href: "/app/calendar",
    color: { rgbVar: "--rgb-green", label: "Green" },
    icon: CalendarDays,
  },
  {
    key: "tasks",
    name: "Daily Tasks",
    href: "/app/tasks",
    color: { rgbVar: "--rgb-orange", label: "Orange" },
    icon: ListTodo,
  },
  {
    key: "notes",
    name: "Notes",
    href: "/app/notes",
    color: { rgbVar: "--rgb-yellow", label: "Yellow" },
    icon: NotebookPen,
  },
  {
    key: "files",
    name: "Data Files",
    href: "/app/files",
    color: { rgbVar: "--rgb-blue", label: "Blue" },
    icon: FileText,
  },
  {
    key: "archive",
    name: "Archive",
    href: "/app/archive",
    color: { rgbVar: "--rgb-violet", label: "Violet" },
    icon: Archive,
  },
  {
    key: "progress",
    name: "Progress",
    href: "/app/progress",
    color: { rgbVar: "--rgb-pink", label: "Pink" },
    icon: TrendingUp,
  },
  {
    key: "profile",
    name: "Profile",
    href: "/app/profile",
    color: { rgbVar: "--rgb-red", label: "Red" },
    icon: User,
  },
];

