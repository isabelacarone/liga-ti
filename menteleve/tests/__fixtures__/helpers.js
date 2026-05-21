const prisma = require("../../src/prismaClient");
const crypto = require("crypto");

function makeToken(usuarioId) {
  return `${crypto.randomBytes(32).toString("hex")}_${usuarioId}`;
}

async function criarUsuario(overrides = {}) {
  const email = overrides.email ?? `test_${Date.now()}@example.com`;
  const usuario = await prisma.usuario.create({
    data: {
      nome: overrides.nome ?? "Usuário Teste",
      email,
      senhaHash: crypto.createHash("sha256").update("senha123").digest("hex"),
      premium: overrides.premium ?? false,
    },
  });
  return { usuario, token: makeToken(usuario.id) };
}

async function limparBanco() {
  await prisma.registroHabito.deleteMany();
  await prisma.habito.deleteMany();
  await prisma.tarefa.deleteMany();
  await prisma.meta.deleteMany();
  await prisma.financa.deleteMany();
  await prisma.usuario.deleteMany();
}

module.exports = { makeToken, criarUsuario, limparBanco };
