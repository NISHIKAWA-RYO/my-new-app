import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Tx = {
  id: string;
  textbookId: string;
  buyerId: string;
  sellerId?: string;
  status: string;
  createdAt: string;
};

export default function TransactionList() {
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/transactions", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((b) => setItems(b.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <main className="mx-auto max-w-4xl px-6 py-16">読み込み中...</main>;
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-white">
      <h1 className="text-2xl font-semibold">取引一覧</h1>
      <div className="mt-6 space-y-3">
        {items.map((t) => (
          <Link
            key={t.id}
            to={`/transactions/${t.id}`}
            className="block rounded bg-white/5 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">取引: {t.id}</div>
                <div className="text-sm text-slate-300">
                  教科書: {t.textbookId}
                </div>
              </div>
              <div className="text-sm text-slate-400">{t.status}</div>
            </div>
          </Link>
        ))}
        {items.length === 0 && (
          <div className="text-slate-400">取引はありません</div>
        )}
      </div>
    </main>
  );
}
