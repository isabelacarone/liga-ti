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
    const tarefas = await prisma.tarefa.findMany({
      where: filtro,
      orderBy: { dataPrevista: "asc" },
    });
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const tarefa = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
    if (tarefa.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });
    res.json(tarefa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

router.post("/", async (req, res) => {
  const { titulo, dataPrevista } = req.body;
  if (!titulo) return res.status(400).json({ erro: "Campos obrigatórios: titulo" });

  try {
    const tarefa = await prisma.tarefa.create({
      data: {
        usuarioId: req.usuarioId,
        titulo,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : null,
      },
    });
    res.status(201).json(tarefa);
  } catch (err) {
    if (err.code === "P2003") return res.status(404).json({ erro: "Usuário não encontrado" });
    res.status(500).json({ erro: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { titulo, dataPrevista, concluida } = req.body;
  try {
    const tarefa = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
    if (tarefa.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });

    const atualizada = await prisma.tarefa.update({
      where: { id: req.params.id },
      data: {
        titulo,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined,
        concluida,
      },
    });
    res.json(atualizada);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  const { titulo, data_prevista, dataPrevista, concluida } = req.body;
  const dataField = data_prevista || dataPrevista;
  try {
    const tarefa = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
    if (tarefa.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });

    const atualizada = await prisma.tarefa.update({
      where: { id: req.params.id },
      data: {
        ...(titulo && { titulo }),
        ...(dataField && { dataPrevista: new Date(dataField) }),
        ...(concluida !== undefined && { concluida }),
      },
    });
    res.json(atualizada);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

router.patch("/:id/concluir", async (req, res) => {
  try {
    const tarefa = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
    if (tarefa.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });

    const atualizada = await prisma.tarefa.update({
      where: { id: req.params.id },
      data: { concluida: true },
    });
    res.json(atualizada);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const tarefa = await prisma.tarefa.findUnique({ where: { id: req.params.id } });
    if (!tarefa) return res.status(404).json({ erro: "Tarefa não encontrada" });
    if (tarefa.usuarioId !== req.usuarioId) return res.status(403).json({ erro: "Acesso negado" });

    await prisma.tarefa.delete({ where: { id: req.params.id } });
    res.json({ mensagem: "Tarefa removida com sucesso" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ erro: "Tarefa não encontrada" });
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
