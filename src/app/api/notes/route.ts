import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

const getSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const putSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().max(140).optional(),
  content: z.string().max(20000),
});

export async function GET(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = getSchema.safeParse({ date: url.searchParams.get("date") });
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const date = new Date(parsed.data.date + "T00:00:00.000Z");
  const note = await db.note.findUnique({
    where: { userId_date: { userId, date } },
  });

  return NextResponse.json({ note });
}

export async function PUT(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = putSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const date = new Date(parsed.data.date + "T00:00:00.000Z");
  const note = await db.note.upsert({
    where: { userId_date: { userId, date } },
    create: {
      userId,
      date,
      title: parsed.data.title,
      content: parsed.data.content,
    },
    update: {
      title: parsed.data.title,
      content: parsed.data.content,
    },
  });

  return NextResponse.json({ note });
}

