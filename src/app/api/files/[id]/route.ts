import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const json = (await req.json().catch(() => null)) as { archived?: boolean } | null;
  if (!json || typeof json.archived !== "boolean") {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const file = await db.dataFile.findFirst({ where: { id, userId } });
  if (!file) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const updated = await db.dataFile.update({
    where: { id },
    data: { archivedAt: json.archived ? new Date() : null },
  });

  return NextResponse.json({ file: updated });
}

