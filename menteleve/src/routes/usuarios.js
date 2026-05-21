const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

// GET /api/usuarios — Lista todos os usuários
router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        premium: true,
        criadoEm: true,
        _count: {
          select: { tarefas: true, habitos: true, metas: true, financas: true },
        },
      },
    });
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /api/usuarios/:id — Busca um usuário pelo ID
router.get("/:id", async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        nome: true,
        email: true,
        premium: true,
        criadoEm: true,
        tarefas: true,
        habitos: true,
        metas: true,
        financas: true,
      },
    });
    if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado" });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /api/usuarios — Cria um novo usuário
router.post("/", async (req, res) => {
  const { nome, email, senhaHash, premium } = req.body;

  if (!nome || !email || !senhaHash) {
    return res.status(400).json({ erro: "Campos obrigatórios: nome, email, senhaHash" });
  }

  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, senhaHash, premium: premium ?? false },
    });
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ erro: "E-mail já cadastrado" });
    }
    res.status(500).json({ erro: err.message });
  }
});

// PUT /api/usuarios/:id — Atualiza dados do usuário
router.put("/:id", async (req, res) => {
  const { nome, email, senhaHash, premium } = req.body;
  try {
    const usuario = await prisma.usuario.update({
      where: { id: req.params.id },
      data: { nome, email, senhaHash, premium },
    });
    res.json(usuario);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Usuário não encontrado" });
    if (err.code === "P2002") return res.status(409).json({ erro: "E-mail já cadastrado" });
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /api/usuarios/:id — Remove um usuário (e todos os seus dados em cascata)
router.delete("/:id", async (req, res) => {
  try {
    await prisma.usuario.delete({ where: { id: req.params.id } });
    res.json({ mensagem: "Usuário removido com sucesso" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
