import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};
type Tx = {
  id: string;
  textbookId: string;
  buyerId: string;
  sellerId?: string;
  status: string;
  createdAt: string;
  viewerIsSeller?: boolean;
  viewerIsBuyer?: boolean;
};

export default function TransactionPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [tx, setTx] = useState<Tx | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/transactions/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((b) => setTx(b.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));

    fetch(`/api/transactions/${id}/messages`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((b) => setMsgs(b.data || []))
      .catch(() => {});
  }, [id]);

  async function send() {
    if (!id || !text.trim()) return;
    try {
      const res = await fetch(`/api/transactions/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("failed");
      const body = await res.json();
      setMsgs((s) => [...s, body.data]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  }

  if (loading)
    return <main className="mx-auto max-w-4xl px-6 py-16">読み込み中...</main>;
  if (!tx)
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">取引が見つかりません</main>
    );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">取引: {tx.id}</h1>
        <button onClick={() => nav(-1)} className="text-sm text-slate-300">
          戻る
        </button>
      </div>

      <div className="mt-4">
        <div className="text-sm text-slate-400">ステータス: {tx.status}</div>
        {tx.viewerIsSeller && tx.status !== "CLOSED" && (
          <div className="mt-2">
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`/api/transactions/${tx.id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ status: "CLOSED" }),
                  });
                  if (!res.ok) throw new Error("failed");
                  const body = await res.json();
                  setTx(body.data);
                } catch (err) {
                  console.error(err);
                }
              }}
              className="rounded bg-green-600 px-3 py-1 text-sm"
            >
              取引を完了する（出品者）
            </button>
          </div>
        )}
      </div>

      <section className="mt-6">
        <h2 className="font-medium">メッセージ</h2>
        <div className="mt-3 space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className="rounded bg-white/5 p-3">
              <div className="text-sm text-slate-300">
                {m.senderId} ·{" "}
                <span className="text-xs text-slate-500">
                  {new Date(m.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="mt-1">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded bg-white/5 px-3 py-2 text-white"
            placeholder="メッセージを入力"
          />
          <button onClick={send} className="rounded bg-keio-500 px-4 py-2">
            送信
          </button>
        </div>
      </section>
    </main>
  );
}
