import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/require-user";

const msgSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

const bodySchema = z.object({
  messages: z.array(msgSchema).min(1).max(30),
});

function tokenize(q: string) {
  return Array.from(
    new Set(
      q
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 3)
    )
  ).slice(0, 12);
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });

  const lastUser = [...parsed.data.messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.content ?? "";
  const terms = tokenize(question);

  const [recentNotes, fileChunks] = await Promise.all([
    db.note.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 10,
      select: { date: true, title: true, content: true },
    }),
    terms.length
      ? db.dataFileChunk.findMany({
          where: {
            userId,
            OR: terms.map((t) => ({ content: { contains: t } })),
          },
          take: 12,
          orderBy: { dataFileId: "desc" },
          select: {
            dataFileId: true,
            idx: true,
            content: true,
            file: { select: { filename: true } },
          },
        })
      : Promise.resolve([]),
  ]);

  const contextParts: string[] = [];
  if (recentNotes.length) {
    contextParts.push(
      "Recent diary notes:\n" +
        recentNotes
          .map((n) => {
            const d = n.date.toISOString().slice(0, 10);
            const title = n.title ? ` — ${n.title}` : "";
            const snippet = n.content.slice(0, 1200);
            return `- ${d}${title}\n${snippet}`;
          })
          .join("\n\n")
    );
  }
  if (fileChunks.length) {
    contextParts.push(
      "Relevant uploaded file excerpts:\n" +
        fileChunks
          .map((c) => `- ${c.file.filename} [chunk ${c.idx}]\n${c.content}`)
          .join("\n\n")
    );
  }

  const system = [
    "You are PrismDay AI, a helpful assistant for a productivity app.",
    "Answer the user using the provided context when relevant.",
    "If the context does not contain the answer, say what you can infer and what is missing.",
    "Be concise and action-oriented.",
    "If the user asks about tasks/progress, explain how to do it in the app.",
  ].join("\n");

  const userContext = contextParts.length ? contextParts.join("\n\n---\n\n") : "No extra context available.";

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Local fallback (no cloud key yet): return retrieval context summary.
    return NextResponse.json(
      {
        reply:
          "OpenAI is not configured yet (missing `OPENAI_API_KEY`).\n\n" +
          "Here’s the context I found from your app data:\n\n" +
          userContext,
        error: "missing_openai_key",
        hint: "Add your OpenAI key in `app/.env` as `OPENAI_API_KEY=...` and restart `npm run dev`.",
      },
      { status: 200 }
    );
  }

  const client = new OpenAI({ apiKey });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Context:\n${userContext}` },
      ...parsed.data.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const reply = completion.choices[0]?.message?.content?.trim() ?? "";
  return NextResponse.json({ reply });
}

