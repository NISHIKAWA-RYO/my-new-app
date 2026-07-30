import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

// GET /api/faculties
router.get("/", async (_req, res) => {
  const items = await prisma.faculty.findMany({ orderBy: { nameJa: "asc" } });
  res.json({ data: items });
});

export default router;
