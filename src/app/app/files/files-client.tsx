"use client";

import { useEffect, useRef, useState } from "react";
import { ModulePage } from "@/components/module-page";
import { PageTransition } from "@/components/page-transition";
import { motion } from "framer-motion";

type DataFile = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
};

export default function FilesClient() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<DataFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh(opts?: { showLoading?: boolean }) {
    if (opts?.showLoading) setLoading(true);
    setError(null);
    const res = await fetch("/api/files", { cache: "no-store" });
    const body = (await res.json().catch(() => null)) as { files?: DataFile[]; error?: string } | null;

    if (!res.ok) {
      setError(body?.error ?? "failed");
      setLoading(false);
      return;
    }

    setFiles(body?.files ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function uploadSelected() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/files", { method: "POST", body: fd });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "upload_failed");
      setUploading(false);
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    setUploading(false);
    await refresh({ showLoading: true });
  }

  async function archiveFile(id: string) {
    setError(null);

    const res = await fetch(`/api/files/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ archived: true }),
    });

    if (!res.ok) {
      setError("Could not archive file.");
      return;
    }

    await refresh({ showLoading: true });
  }

  return (
    <PageTransition>
      <ModulePage
        moduleKey="files"
        title="Data Files"
        subtitle="Upload text files now. Next step: add .docx/.pdf parsing + AI retrieval."
      >
        {/* MAIN CONTENT (NO FULL SCREEN HERE) */}
        <div className="max-w-5xl mx-auto space-y-6">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[2rem] backdrop-blur-2xl bg-white/10 border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-8"
          >

            <div className="bg-[#12221A] rounded-[1.5rem] p-6 text-white grid gap-6 md:grid-cols-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.6)]">

              {/* UPLOAD */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Upload</div>

                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="rounded-xl px-4 py-2 text-sm bg-white/10 hover:bg-white/20 transition"
                    >
                      Upload
                    </button>
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept="text/*,application/json,application/xml,application/yaml,application/x-yaml"
                    className="hidden"
                    onChange={() => void uploadSelected()}
                  />

                  <div className="mt-3 text-xs text-white/60">
                    Supported: <span className="text-white">.txt</span>, JSON, XML, YAML up to 5MB.
                  </div>
                </div>

                {uploading && (
                  <div className="mt-4 text-sm text-white/70">Uploading…</div>
                )}

                {error && (
                  <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}
              </motion.div>

              {/* FILE LIST */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md">
                <div className="text-sm font-semibold">Your files</div>

                <div className="mt-4 space-y-3">
                  {loading ? (
                    <div className="text-sm text-white/60">Loading…</div>
                  ) : files.length === 0 ? (
                    <div className="text-sm text-white/60">No files uploaded yet.</div>
                  ) : (
                    files.map((f) => (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_6px_20px_rgba(0,0,0,0.4)]"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {f.filename}
                          </div>
                          <div className="text-[11px] text-white/60">
                            {(f.sizeBytes / 1024).toFixed(1)} KB •{" "}
                            {new Date(f.createdAt).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/files/${f.id}/download`}
                            className="h-10 w-10 rounded-xl grid place-items-center bg-white/10 hover:bg-white/20"
                          >
                            ↓
                          </a>

                          <button
                            type="button"
                            onClick={() => void archiveFile(f.id)}
                            className="h-10 w-10 rounded-xl grid place-items-center bg-white/10 hover:bg-white/20"
                          >
                            ⬆
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </ModulePage>
    </PageTransition>
  );
}