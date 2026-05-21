const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { autenticar } = require("../middleware/auth");

router.use(autenticar);

router.get("/", async (req, res) => {
  const { concluida } = req.query;
  const filtro = { usuarioId: req.usuarioId };
  if (concluida !== undefined) filtro.concluida = concluida === "true";

  try {
    const metas = await prisma.meta.findMany({
      where: filtro,
      orderBy: { prazo: "asc" },
    });
    res.json(metas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const meta = await prisma.meta.findUnique({ where: { id: req.params.id } });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    if (meta.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });
    res.json(meta);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post("/", async (req, res) => {
  const { titulo, prazo, progressoPct } = req.body;

  if (!titulo || !prazo) {
    return res.status(400).json({ erro: "Campos obrigatórios: titulo, prazo" });
  }
  if (progressoPct !== undefined && (progressoPct < 0 || progressoPct > 100)) {
    return res.status(400).json({ erro: "progressoPct deve estar entre 0 e 100" });
  }

  try {
    const pct = progressoPct ?? 0;
    const meta = await prisma.meta.create({
      data: {
        usuarioId: req.usuarioId,
        titulo,
        prazo: new Date(prazo),
        progressoPct: pct,
        concluida: pct === 100,
      },
    });
    res.status(201).json(meta);
  } catch (err) {
    if (err.code === "P2003") return res.status(404).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { titulo, prazo, progressoPct, concluida } = req.body;

  if (progressoPct !== undefined && (progressoPct < 0 || progressoPct > 100)) {
    return res.status(400).json({ erro: "progressoPct deve estar entre 0 e 100" });
  }

  try {
    const meta = await prisma.meta.findUnique({ where: { id: req.params.id } });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    if (meta.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });

    const atualizada = await prisma.meta.update({
      where: { id: req.params.id },
      data: {
        titulo,
        prazo: prazo ? new Date(prazo) : undefined,
        progressoPct,
        concluida: progressoPct === 100 ? true : concluida,
      },
    });
    res.json(atualizada);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Meta não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

router.patch("/:id/progresso", async (req, res) => {
  const { progressoPct } = req.body;

  if (progressoPct === undefined || progressoPct < 0 || progressoPct > 100) {
    return res.status(400).json({ erro: "progressoPct é obrigatório e deve estar entre 0 e 100" });
  }

  try {
    const meta = await prisma.meta.findUnique({ where: { id: req.params.id } });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    if (meta.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });

    const atualizada = await prisma.meta.update({
      where: { id: req.params.id },
      data: {
        progressoPct,
        concluida: progressoPct === 100,
      },
    });
    res.json(atualizada);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Meta não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const meta = await prisma.meta.findUnique({ where: { id: req.params.id } });
    if (!meta) return res.status(404).json({ erro: "Meta não encontrada" });
    if (meta.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });

    await prisma.meta.delete({ where: { id: req.params.id } });
    res.json({ mensagem: "Meta removida com sucesso" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Meta não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
