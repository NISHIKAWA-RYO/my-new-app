import { Router } from "express";
import { prisma } from "../prisma.js";

function getUserIdFromReq(req: any) {
  return (req.session && req.session.userId) || null;
}

const router = Router();

// POST /api/textbooks
router.post("/", async (req, res) => {
  const body = req.body;
  const required = ["title", "price", "saleFormat", "condition", "facultyName"];
  for (const k of required) {
    if (!body[k]) {
      return res
        .status(400)
        .json({ error: { code: "BAD_REQUEST", message: `${k} is required` } });
    }
  }

  const sessionUserId = (req.session as any)?.userId;
  // ensure a user exists for this session
  let userId = sessionUserId;
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });

  // upsert a demo user for this session
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

  // find or create faculty
  let facultyId: string | null = null;
  if (body.facultyName) {
    const existing = await prisma.faculty.findUnique({
      where: { nameJa: String(body.facultyName) },
    });
    if (existing) facultyId = existing.id;
    else {
      const f = await prisma.faculty.create({
        data: { nameJa: String(body.facultyName) },
      });
      facultyId = f.id;
    }
  }

  const saleFormat =
    String(body.saleFormat).toLowerCase() === "auction"
      ? "auction"
      : "fixed_price";
  const conditionMap: Record<string, string> = {
    LIKE_NEW: "like_new",
    PENCIL_WRITING: "pencil_marks",
    MARKER: "marker_marks",
    DAMAGED: "damaged",
  };
  const condition = conditionMap[String(body.condition)] || "like_new";

  const tb = await prisma.textbook.create({
    data: {
      sellerId: userId,
      facultyId: facultyId || undefined,
      title: String(body.title),
      price: Number(body.price) || 0,
      saleFormat: saleFormat as any,
      condition: condition as any,
      lectureName: body.lectureName ? String(body.lectureName) : undefined,
      professorName: body.professorName
        ? String(body.professorName)
        : undefined,
      author: body.author ? String(body.author) : undefined,
      publisher: body.publisher ? String(body.publisher) : undefined,
      publicationYear: body.publicationYear
        ? Number(body.publicationYear)
        : undefined,
    },
  });

  if (body.mainImageUrl) {
    await prisma.textbookImage.create({
      data: { textbookId: tb.id, url: String(body.mainImageUrl) },
    });
  }

  const created = await prisma.textbook.findUnique({
    where: { id: tb.id },
    include: { images: true, faculty: true },
  });
  res.status(201).json({ data: created });
});

// GET /api/textbooks
router.get("/", async (req, res) => {
  const { q, facultyName, saleFormat, page = "1", limit = "20" } = req.query;
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Math.min(100, Number(limit) || 20));

  const where: any = { status: "listed" };
  if (q && typeof q === "string") {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { lectureName: { contains: q, mode: "insensitive" } },
      { professorName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (facultyName && typeof facultyName === "string") {
    // find facultyId
    const f = await prisma.faculty.findUnique({
      where: { nameJa: String(facultyName) },
    });
    if (f) where.facultyId = f.id;
  }
  if (saleFormat && typeof saleFormat === "string") {
    const sf =
      String(saleFormat).toLowerCase() === "auction"
        ? "auction"
        : "fixed_price";
    where.saleFormat = sf;
  }

  const [items, total] = await Promise.all([
    prisma.textbook.findMany({
      where,
      include: { images: true, faculty: true },
      skip: (p - 1) * l,
      take: l,
      orderBy: { createdAt: "desc" },
    }),
    prisma.textbook.count({ where }),
  ]);
  res.json({ data: items, meta: { total, page: p, limit: l } });
});

// GET /api/textbooks/:id
router.get("/:id", async (req, res) => {
  const tb = await prisma.textbook.findUnique({
    where: { id: req.params.id },
    include: { images: true, faculty: true },
  });
  if (!tb)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Textbook not found" } });
  res.json({ data: tb });
});

// GET /api/textbooks/:id/favorite
router.get("/:id/favorite", async (req, res) => {
  const userId = getUserIdFromReq(req as any);
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
  const fav = await prisma.favorite
    .findUnique({
      where: { userId_textbookId: { userId, textbookId: req.params.id } },
    })
    .catch(() => null);
  res.json({ data: { favorited: Boolean(fav) } });
});

// POST /api/textbooks/:id/favorite
router.post("/:id/favorite", async (req, res) => {
  const userId = getUserIdFromReq(req as any);
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
  const tb = await prisma.textbook.findUnique({ where: { id: req.params.id } });
  if (!tb)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Textbook not found" } });
  const fav = await prisma.favorite.upsert({
    where: { userId_textbookId: { userId, textbookId: req.params.id } },
    create: { userId, textbookId: req.params.id },
    update: {},
  });
  res.status(201).json({ data: fav });
});

// DELETE /api/textbooks/:id/favorite
router.delete("/:id/favorite", async (req, res) => {
  const userId = getUserIdFromReq(req as any);
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
  await prisma.favorite.deleteMany({
    where: { userId, textbookId: req.params.id },
  });
  res.status(204).end();
});

// POST /api/textbooks/:id/transactions  -> create a new transaction (contact)
router.post("/:id/transactions", async (req, res) => {
  const userId = getUserIdFromReq(req as any);
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
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
  const tb = await prisma.textbook.findUnique({ where: { id: req.params.id } });
  if (!tb)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Textbook not found" } });
  const sellerId = tb.sellerId;
  const tx = await prisma.transaction.create({
    data: { textbookId: tb.id, buyerId: userId, sellerId: sellerId },
  });
  res.status(201).json({ data: tx });
});

// POST /api/textbooks/:id/claim-seller
router.post("/:id/claim-seller", async (req, res) => {
  const userId = getUserIdFromReq(req as any);
  if (!userId)
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "No user" } });
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
  const tb = await prisma.textbook.findUnique({ where: { id: req.params.id } });
  if (!tb)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Textbook not found" } });
  const updated = await prisma.textbook.update({
    where: { id: tb.id },
    data: { sellerId: userId },
  });
  res.json({
    data: { textbookId: tb.id, sellerId: userId, updatedAt: updated.updatedAt },
  });
});

export default router;
