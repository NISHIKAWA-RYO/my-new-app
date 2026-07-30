import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

// GET /api/transactions?role=buyer|seller|all
router.get("/", async (req, res) => {
  const userId = (req.session as any)?.userId;
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
  const role = String(req.query.role || "all");
  const where: any = {};
  if (role === "buyer") where.buyerId = userId;
  else if (role === "seller") where.sellerId = userId;
  else where.OR = [{ buyerId: userId }, { sellerId: userId }];
  const items = await prisma.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json({ data: items });
});

// GET /api/transactions/:id
router.get("/:id", async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: req.params.id },
  });
  if (!tx)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
  const viewerId = (req.session as any)?.userId;
  const viewerIsBuyer = Boolean(viewerId && tx.buyerId === viewerId);
  const viewerIsSeller = Boolean(viewerId && tx.sellerId === viewerId);
  res.json({ data: { ...tx, viewerIsBuyer, viewerIsSeller } });
});

// GET messages
router.get("/:id/messages", async (req, res) => {
  const msgs = await prisma.message.findMany({
    where: { transactionId: req.params.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ data: msgs });
});

// POST message
router.post("/:id/messages", async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: req.params.id },
  });
  if (!tx)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
  const userId = (req.session as any)?.userId;
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
  const text = String(req.body?.text || "");
  if (!text)
    return res
      .status(400)
      .json({ error: { code: "BAD_REQUEST", message: "text required" } });
  // ensure user exists
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: `${userId}@example.test`,
      passwordHash: "demo",
      name: `demo-${userId}`,
    },
    update: {},
  });
  const m = await prisma.message.create({
    data: { transactionId: tx.id, senderId: userId, content: text },
  });
  res.status(201).json({ data: m });
});

// PATCH /api/transactions/:id/status
// PATCH /api/transactions/:id/status
router.patch("/:id/status", async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: req.params.id },
  });
  if (!tx)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
  const userId = (req.session as any)?.userId;
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
  const allowed = userId === tx.buyerId || userId === tx.sellerId;
  if (!allowed)
    return res
      .status(403)
      .json({ error: { code: "FORBIDDEN", message: "Not allowed" } });
  let status = String(req.body?.status || "").toLowerCase();
  if (status === "closed") status = "completed";
  if (
    ![
      "negotiating",
      "meeting_scheduled",
      "awaiting_pickup",
      "completed",
      "cancelled",
    ].includes(status)
  )
    return res
      .status(400)
      .json({ error: { code: "BAD_REQUEST", message: "invalid status" } });
  const updated = await prisma.transaction.update({
    where: { id: tx.id },
    data: { status: status as any },
  });
  const viewerId = userId;
  const viewerIsBuyer = viewerId === updated.buyerId;
  const viewerIsSeller = viewerId === updated.sellerId;
  res.json({ data: { ...updated, viewerIsBuyer, viewerIsSeller } });
});

export default router;
