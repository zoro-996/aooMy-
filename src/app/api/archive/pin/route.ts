import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

const pinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/),
});

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { archivePinHash: true },
  });

  return NextResponse.json({ hasPin: !!user?.archivePinHash });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = pinSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const { pin } = parsed.data;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { archivePinHash: true },
  });

  if (!user?.archivePinHash) {
    const hash = await bcrypt.hash(pin, 12);
    await db.user.update({
      where: { id: userId },
      data: { archivePinHash: hash },
    });
    return NextResponse.json({ ok: true, mode: "set" });
  }

  const ok = await bcrypt.compare(pin, user.archivePinHash);
  if (!ok) return NextResponse.json({ error: "invalid_pin" }, { status: 403 });

  return NextResponse.json({ ok: true, mode: "verify" });
}

