import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthRegister() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b?.error?.message || `HTTP ${res.status}`);
      }
      nav("/textbooks");
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-12 text-white">
      <h1 className="text-2xl font-semibold">アカウント作成</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded border border-red-600 p-2 text-red-300">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-slate-300">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <button className="rounded bg-keio-500 px-4 py-2" disabled={loading}>
            {loading ? "処理中..." : "登録してログイン"}
          </button>
        </div>
      </form>
    </main>
  );
}
