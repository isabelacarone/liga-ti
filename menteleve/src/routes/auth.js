const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const prisma = require("../prismaClient");

// Gera hash da senha
function hashSenha(senha) {
  return crypto.createHash("sha256").update(senha).digest("hex");
}

// Gera token JWT simples (em produção, usar biblioteca real)
function gerarToken(usuarioId) {
  return crypto.randomBytes(32).toString("hex") + "_" + usuarioId;
}

// ─ POST /auth/registrar
router.post("/registrar", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res
        .status(400)
        .json({ erro: "Nome, email e senha são obrigatórios" });
    }

    // Verifica se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ erro: "Email já cadastrado" });
    }

    // Cria novo usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senhaHash: hashSenha(senha),
      },
    });

    const token = gerarToken(usuario.id);

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ erro: "Erro ao registrar", detalhe: err.message });
  }
});

// ─ POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    // Busca usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    // Verifica senha
    const senhaCorreta = hashSenha(senha) === usuario.senhaHash;

    if (!senhaCorreta) {
      return res.status(401).json({ erro: "Email ou senha incorretos" });
    }

    const token = gerarToken(usuario.id);

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        premium: usuario.premium,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao fazer login", detalhe: err.message });
  }
});

module.exports = router;
