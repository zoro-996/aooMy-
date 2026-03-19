import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const file = await db.dataFile.findFirst({ where: { id, userId } });
  if (!file) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const abs = path.join(/* turbopackIgnore: true */ process.cwd(), file.storagePath);
  const buf = await fs.readFile(abs);

  return new NextResponse(buf, {
    headers: {
      "content-type": file.mimeType || "application/octet-stream",
      "content-disposition": `attachment; filename="${encodeURIComponent(file.filename)}"`,
    },
  });
}

