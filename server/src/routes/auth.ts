import { Router } from "express";
import { prisma } from "../prisma.js";
// @ts-ignore
import bcrypt from "bcryptjs";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name)
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "email, password and name required",
      },
    });
  try {
    const hash = bcrypt.hashSync(String(password), 10);
    const user = await prisma.user.create({
      data: { email: String(email), passwordHash: hash, name: String(name) },
    });
    (req.session as any).userId = user.id;
    res
      .status(201)
      .json({ data: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    if (String(err.message).includes("Unique constraint")) {
      return res
        .status(409)
        .json({ error: { code: "CONFLICT", message: "email already exists" } });
    }
    console.error(err);
    res
      .status(500)
      .json({ error: { code: "INTERNAL", message: "unexpected" } });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({
      error: { code: "BAD_REQUEST", message: "email and password required" },
    });
  const user = await prisma.user.findUnique({
    where: { email: String(email) },
  });
  if (!user)
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "invalid credentials" },
    });
  const ok = bcrypt.compareSync(String(password), user.passwordHash);
  if (!ok)
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "invalid credentials" },
    });
  (req.session as any).userId = user.id;
  res.json({ data: { id: user.id, email: user.email, name: user.name } });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session?.destroy?.(() => {});
  res.status(204).end();
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "no user" } });
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, facultyId: true },
  });
  if (!user)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "user not found" } });
  res.json({ data: user });
});

export default router;
