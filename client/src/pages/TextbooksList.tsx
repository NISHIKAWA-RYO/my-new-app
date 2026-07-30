import React, { useEffect, useState } from "react";
import TextbookCard from "../components/TextbookCard";
import type { Textbook } from "../data/sample-textbooks";

export default function TextbooksList() {
  const [items, setItems] = useState<Textbook[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setError(null);
    fetch("/api/textbooks")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (mounted) setItems(body.data || []);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setError(String(err.message || err));
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">教科書一覧</h1>
      </header>

      {error && (
        <div className="rounded border border-red-600 bg-red-50/10 p-4 text-red-300">
          エラー: {error}
        </div>
      )}

      {!items && !error && (
        <div className="space-y-3">
          <div className="h-28 rounded-lg bg-white/5" />
          <div className="h-28 rounded-lg bg-white/5" />
        </div>
      )}

      {items && (
        <div className="grid gap-4">
          {items.map((tb) => (
            <TextbookCard key={tb.id} tb={tb} />
          ))}
        </div>
      )}
    </main>
  );
}
