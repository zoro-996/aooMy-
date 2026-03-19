import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

function chunkText(text: string, chunkSize = 1200) {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (!clean) return [];
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += chunkSize) {
    chunks.push(clean.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const files = await db.dataFile.findMany({
    where: { userId, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ files });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  // For v1: accept only text/* and basic types that we treat as text.
  const mime = file.type || "application/octet-stream";
  const allowed =
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml" ||
    mime === "application/x-yaml" ||
    mime === "application/yaml";

  if (!allowed) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }

  const dir = path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads", userId);
  await ensureDir(dir);

  const safeName = file.name.replace(/[^\w.\- ()\[\]]+/g, "_").slice(0, 120) || "upload.txt";
  const id = crypto.randomUUID();
  const storageRel = path.join("data", "uploads", userId, `${id}__${safeName}`);
  const storageAbs = path.join(/* turbopackIgnore: true */ process.cwd(), storageRel);

  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(storageAbs, buf);

  const text = buf.toString("utf8");
  const chunks = chunkText(text);

  const created = await db.dataFile.create({
    data: {
      id,
      userId,
      filename: safeName,
      mimeType: mime,
      sizeBytes: file.size,
      storagePath: storageRel.replace(/\\/g, "/"),
      chunks: {
        create: chunks.map((content, idx) => ({
          userId,
          idx,
          content,
        })),
      },
    },
    include: { chunks: true },
  });

  return NextResponse.json({ file: created }, { status: 201 });
}

