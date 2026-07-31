import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import session from "express-session";
// 【修正】相対パスのインポートには .js を付けるのじゃぞ
import { healthHandler } from "./routes/health.js";
import textbooksRouter from "./routes/textbooks.js";
import transactionsRouter from "./routes/transactions.js";
import facultiesRouter from "./routes/faculties.js";
import authRouter from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 【重要】ビルドログに合わせてパスを ../../dist/client に修正したぞ
const buildPath = path.join(__dirname, "../../dist/client");

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET ?? "dev-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    }),
  );

  app.use((req, _res, next) => {
    try {
      const s = req.session as any;
      if (!s.userId) {
        s.userId = `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      }
    } catch (err) {
      // ignore
    }
    next();
  });

  // 1. まずは API の設定じゃ
  app.get("/api/health", healthHandler);
  app.use("/api/textbooks", textbooksRouter);
  app.use("/api/transactions", transactionsRouter);
  app.use("/api/faculties", facultiesRouter);
  app.use("/api/auth", authRouter);

  // 2. 次に「静的ファイル（React）」の設定をここに持ってくるのじゃ！
  app.use(express.static(buildPath));

  // 3. どの API にも当てはまらなければ、React の画面を返すのじゃ
  app.get("*any", (req: Request, res: Response) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });

  // 4. 最後にエラーハンドリングじゃ
  // (以前ここにいた 404 ハンドラーは *any とぶつかるので削除したぞい)
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      res.status(500).json({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error",
        },
      });
    },
  );

  return app;
}
