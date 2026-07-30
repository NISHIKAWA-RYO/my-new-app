import cors from "cors";
import express from "express";
import session from "express-session";
import { healthHandler } from "./routes/health";
import textbooksRouter from "./routes/textbooks";
import transactionsRouter from "./routes/transactions";
import facultiesRouter from "./routes/faculties";
import authRouter from "./routes/auth";

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

  // Ensure a simple userId on session for demo purposes
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

  app.get("/api/health", healthHandler);
  app.use("/api/textbooks", textbooksRouter);
  app.use("/api/transactions", transactionsRouter);
  app.use("/api/faculties", facultiesRouter);
  app.use("/api/auth", authRouter);

  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    });
  });

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
