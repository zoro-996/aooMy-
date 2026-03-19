import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

const createTaskSchema = z.object({
  title: z.string().min(1).max(140),
  description: z.string().max(2000).optional(),
  dueAt: z.string().datetime().optional(),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tasks = await db.task.findMany({
    where: { userId },
    orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const task = await db.task.create({
    data: {
      userId,
      title: parsed.data.title,
      description: parsed.data.description,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : today,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}

