import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

const patchSchema = z.object({
  title: z.string().min(1).max(140).optional(),
  description: z.string().max(2000).nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  completed: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;

  const json = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const existing = await db.task.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const task = await db.task.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description === undefined ? undefined : parsed.data.description,
      dueAt:
        parsed.data.dueAt === undefined
          ? undefined
          : parsed.data.dueAt === null
            ? null
            : new Date(parsed.data.dueAt),
      completedAt:
        parsed.data.completed === undefined
          ? undefined
          : parsed.data.completed
            ? existing.completedAt ?? new Date()
            : null,
    },
  });

  return NextResponse.json({ task });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await db.task.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await db.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

