import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const tasks = await db.task.findMany({
    where: { userId, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
  });

  return NextResponse.json({ tasks });
}

