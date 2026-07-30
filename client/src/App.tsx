import { Link, Route, Routes } from "react-router-dom";
import TextbooksList from "./pages/TextbooksList";
import TextbookDetail from "./pages/TextbookDetail";
import TextbookNew from "./pages/TextbookNew";
import AuthLogin from "./pages/AuthLogin";
import AuthRegister from "./pages/AuthRegister";
import TransactionPage from "./pages/Transaction";
import TransactionList from "./pages/TransactionList";

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-keio-300">
          Campus Trade
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight md:text-7xl">
          慶應学生のための教科書マーケット
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          出品、検索、取引、チャットまでをひとつの流れでつなぐための初期雛形です。
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-keio-500 px-5 py-3 font-medium text-white transition hover:bg-keio-400"
            to="/auth/login"
          >
            ログイン
          </Link>
          <Link
            className="rounded-full border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5"
            to="/textbooks"
          >
            教科書を見る
          </Link>
        </div>
      </section>
    </main>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16 text-slate-900">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-4 text-slate-600">
        この画面は次の実装ステップで具体化します。
      </p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/login" element={<AuthLogin />} />
      <Route path="/auth/register" element={<AuthRegister />} />
      <Route path="/textbooks" element={<TextbooksList />} />
      <Route path="/textbooks/new" element={<TextbookNew />} />
      <Route path="/textbooks/:id" element={<TextbookDetail />} />
      <Route path="/transactions/:id" element={<TransactionPage />} />
      <Route path="/transactions" element={<TransactionList />} />
      <Route path="*" element={<PlaceholderPage title="404 Not Found" />} />
    </Routes>
  );
}
