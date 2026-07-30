import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Textbook } from "../data/sample-textbooks";

export default function TextbookDetail() {
  const { id } = useParams();
  const [tb, setTb] = useState<Textbook | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/textbooks/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        setTb(body.data || null);
      })
      .catch((err) => {
        console.error(err);
        setError(String(err.message || err));
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/textbooks/${id}/favorite`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => setFavorited(Boolean(body?.data?.favorited)))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="h-80 rounded-lg bg-white/5" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="rounded border border-red-600 bg-red-50/10 p-4 text-red-300">
          エラー: {error}
        </div>
      </main>
    );
  }

  if (!tb) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-semibold">教科書が見つかりません</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-white">
      <div className="flex gap-8">
        <img
          src={tb.mainImageUrl}
          alt={tb.title}
          className="h-96 w-64 rounded object-cover"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{tb.title}</h1>
          <p className="mt-2 text-slate-300">
            {tb.lectureName} · {tb.professorName}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="text-2xl font-bold">
              ¥{tb.price.toLocaleString()}
            </div>
            <div className="rounded bg-keio-700 px-2 py-1 text-sm text-keio-100">
              {tb.facultyName}
            </div>
            <div className="text-slate-300">{tb.condition}</div>
          </div>

          <div className="mt-8">
            <button
              onClick={async () => {
                if (!id) return;
                try {
                  const res = await fetch(`/api/textbooks/${id}/transactions`, {
                    method: "POST",
                    credentials: "include",
                  });
                  if (!res.ok) throw new Error("failed to create transaction");
                  const body = await res.json();
                  const txId = body.data?.id;
                  if (txId) window.location.href = `/transactions/${txId}`;
                } catch (err) {
                  console.error(err);
                }
              }}
              className="mr-3 rounded bg-keio-500 px-4 py-2 font-medium text-white"
            >
              連絡する
            </button>

            <button
              onClick={async () => {
                if (favBusy || !id) return;
                setFavBusy(true);
                try {
                  if (!favorited) {
                    await fetch(`/api/textbooks/${id}/favorite`, {
                      method: "POST",
                      credentials: "include",
                    });
                    setFavorited(true);
                  } else {
                    await fetch(`/api/textbooks/${id}/favorite`, {
                      method: "DELETE",
                      credentials: "include",
                    });
                    setFavorited(false);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setFavBusy(false);
                }
              }}
              className={`rounded px-4 py-2 ${favorited ? "bg-yellow-400 text-black" : "border border-white/20 text-white"}`}
            >
              {favorited ? "★ お気に入り済み" : "☆ お気に入り"}
            </button>

            <button
              onClick={async () => {
                if (!id) return;
                try {
                  const res = await fetch(`/api/textbooks/${id}/claim-seller`, {
                    method: "POST",
                    credentials: "include",
                  });
                  if (res.ok) {
                    alert("この端末を出品者として主張しました（デモ）");
                  }
                } catch (err) {
                  console.error(err);
                }
              }}
              className="ml-3 rounded border border-white/20 px-4 py-2 text-white"
            >
              自分を出品者にする
            </button>
          </div>

          <section className="mt-8">
            <h2 className="text-xl font-semibold">説明</h2>
            <p className="mt-2 text-slate-300">
              {tb.title}{" "}
              の説明文です。ここに出品者が入力した説明が表示されます。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
