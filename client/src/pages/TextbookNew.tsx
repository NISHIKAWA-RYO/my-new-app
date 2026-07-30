import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TextbookNew() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [saleFormat, setSaleFormat] = useState<"FIXED_PRICE" | "AUCTION">(
    "FIXED_PRICE",
  );
  const [condition, setCondition] = useState("LIKE_NEW");
  const [facultyName, setFacultyName] = useState("");
  const [faculties, setFaculties] = useState<string[]>([]);
  const [useCustomFaculty, setUseCustomFaculty] = useState(false);
  const [lectureName, setLectureName] = useState("");
  const [professorName, setProfessorName] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) return setError("タイトルを入力してください");
    if (!facultyName.trim()) return setError("学部名を入力してください");
    const parsedPrice = Number(price || 0);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0)
      return setError("価格を正しく入力してください");

    setLoading(true);
    try {
      const res = await fetch("/api/textbooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          price: parsedPrice,
          saleFormat,
          condition,
          facultyName,
          lectureName,
          professorName,
          author,
          publisher,
          publicationYear: publicationYear
            ? Number(publicationYear)
            : undefined,
          mainImageUrl,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || `HTTP ${res.status}`);
      }
      const body = await res.json();
      const id = body.data?.id;
      if (id) navigate(`/textbooks/${id}`);
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    fetch("/api/faculties")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((b) => {
        if (!mounted) return;
        const names = (b.data || []).map((f: any) => f.nameJa);
        setFaculties(names);
        if (names.length && !facultyName) setFacultyName(names[0]);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold text-white">出品作成</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded border border-red-600 bg-red-50/10 p-2 text-red-300">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm text-slate-300">タイトル</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">学部</label>
          {faculties.length > 0 && !useCustomFaculty ? (
            <div className="flex gap-2">
              <select
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
              >
                {faculties.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
                <option value="__other">その他...</option>
              </select>
              <button
                type="button"
                onClick={() => setUseCustomFaculty(true)}
                className="ml-2 rounded border px-3"
              >
                手入力
              </button>
            </div>
          ) : (
            <input
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
            />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300">価格（円）</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">形式</label>
            <select
              value={saleFormat}
              onChange={(e) => setSaleFormat(e.target.value as any)}
              className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
            >
              <option value="FIXED_PRICE">固定価格</option>
              <option value="AUCTION">オークション</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-300">状態</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          >
            <option value="LIKE_NEW">新品同様</option>
            <option value="PENCIL_WRITING">書き込みあり（鉛筆）</option>
            <option value="MARKER">マーカーあり</option>
            <option value="DAMAGED">破損あり</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300">講義名</label>
          <input
            value={lectureName}
            onChange={(e) => setLectureName(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">教授名</label>
          <input
            value={professorName}
            onChange={(e) => setProfessorName(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">著者</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">出版社</label>
          <input
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">出版年（任意）</label>
          <input
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300">
            画像URL（任意）
          </label>
          <input
            value={mainImageUrl}
            onChange={(e) => setMainImageUrl(e.target.value)}
            className="mt-1 w-full rounded bg-white/5 px-3 py-2 text-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-keio-500 px-4 py-2 font-medium text-white"
          >
            {loading ? "送信中..." : "出品する"}
          </button>
        </div>
      </form>
    </main>
  );
}
