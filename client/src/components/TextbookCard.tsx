import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Textbook } from "../data/sample-textbooks";

export default function TextbookCard({ tb }: { tb: Textbook }) {
  const [favorited, setFavorited] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(`/api/textbooks/${tb.id}/favorite`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!mounted) return;
        setFavorited(Boolean(body?.data?.favorited));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [tb.id]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (!favorited) {
        await fetch(`/api/textbooks/${tb.id}/favorite`, {
          method: "POST",
          credentials: "include",
        });
        setFavorited(true);
      } else {
        await fetch(`/api/textbooks/${tb.id}/favorite`, {
          method: "DELETE",
          credentials: "include",
        });
        setFavorited(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="flex w-full max-w-3xl gap-4 rounded-lg bg-white/5 p-4">
      <Link to={`/textbooks/${tb.id}`} className="flex-shrink-0">
        <img
          src={tb.mainImageUrl}
          alt={tb.title}
          className="h-40 w-28 rounded object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{tb.title}</h3>
          <p className="mt-1 text-sm text-slate-300">
            {tb.lectureName} · {tb.professorName}
          </p>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="rounded bg-keio-700 px-2 py-0.5 text-keio-100">
              {tb.facultyName}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-300">
              {tb.condition === "LIKE_NEW" ? "新品同様" : tb.condition}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xl font-bold text-white">
            ¥{tb.price.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/textbooks/${tb.id}`}
              className="rounded bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
            >
              詳細
            </Link>
            <button
              onClick={toggle}
              disabled={busy}
              className={`rounded px-3 py-1 text-sm ${favorited ? "bg-yellow-400 text-black" : "border border-white/20 text-white"}`}
            >
              {favorited ? "★ お気に入り" : "☆ お気に入り"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
