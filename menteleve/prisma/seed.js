// seed.js – Popula o banco com dados de exemplo para o MenteLeve
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

function hashSenha(senha) {
  return crypto.createHash("sha256").update(senha).digest("hex");
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados MenteLeve...\n");

  const emailAlvo = "adriellycosta@gmail.com";
  const senhaPadrao = "123456";

  const usuarioExistente = await prisma.usuario.findUnique({ where: { email: emailAlvo } });

  if (usuarioExistente) {
    console.log(`⚠️ Usuário existente encontrado: ${usuarioExistente.email}. Removendo dados antigos...`);
    await prisma.registroHabito.deleteMany({
      where: { habito: { usuarioId: usuarioExistente.id } },
    });
    await prisma.financa.deleteMany({ where: { usuarioId: usuarioExistente.id } });
    await prisma.meta.deleteMany({ where: { usuarioId: usuarioExistente.id } });
    await prisma.tarefa.deleteMany({ where: { usuarioId: usuarioExistente.id } });
    await prisma.habito.deleteMany({ where: { usuarioId: usuarioExistente.id } });
    await prisma.usuario.delete({ where: { email: emailAlvo } });
  }

  const adrielly = await prisma.usuario.create({
    data: {
      nome: "Adrielly Costa",
      email: emailAlvo,
      senhaHash: hashSenha(senhaPadrao),
      premium: true,
    },
  });
  console.log(`✅ Usuária criada: ${adrielly.nome} (${adrielly.email})`);
  console.log(`🔐 Senha de acesso: ${senhaPadrao}`);

  // ─── Tarefas ───────────────────────────────────────────────────────────
  await prisma.tarefa.createMany({
    data: [
      {
        usuarioId: adrielly.id,
        titulo: "Estudar modelagem de banco de dados",
        dataPrevista: new Date("2025-05-10"),
        concluida: true,
      },
      {
        usuarioId: adrielly.id,
        titulo: "Entregar projeto MenteLeve",
        dataPrevista: new Date("2025-05-20"),
        concluida: false,
      },
      {
        usuarioId: adrielly.id,
        titulo: "Revisar slides da apresentação",
        dataPrevista: new Date("2025-05-18"),
        concluida: false,
      },
    ],
  });
  console.log("✅ Tarefas criadas");

  // ─── Hábitos ───────────────────────────────────────────────────────────
  const habitoAgua = await prisma.habito.create({
    data: {
      usuarioId: adrielly.id,
      nome: "Beber 2L de água",
      frequencia: "diaria",
    },
  });

  const habitoLeitura = await prisma.habito.create({
    data: {
      usuarioId: adrielly.id,
      nome: "Ler 30 minutos",
      frequencia: "diaria",
    },
  });

  const habitoExercicio = await prisma.habito.create({
    data: {
      usuarioId: adrielly.id,
      nome: "Exercício físico",
      frequencia: "semanal",
    },
  });
  console.log("✅ Hábitos criados");

  // ─── Registros de Hábito ───────────────────────────────────────────────
  await prisma.registroHabito.createMany({
    data: [
      { habitoId: habitoAgua.id, data: new Date("2025-05-01"), concluido: true },
      { habitoId: habitoAgua.id, data: new Date("2025-05-02"), concluido: true },
      { habitoId: habitoAgua.id, data: new Date("2025-05-03"), concluido: false },
      { habitoId: habitoLeitura.id, data: new Date("2025-05-01"), concluido: true },
      { habitoId: habitoLeitura.id, data: new Date("2025-05-02"), concluido: false },
      { habitoId: habitoExercicio.id, data: new Date("2025-04-28"), concluido: true },
    ],
  });
  console.log("✅ Registros de hábito criados");

  // ─── Metas ─────────────────────────────────────────────────────────────
  await prisma.meta.createMany({
    data: [
      {
        usuarioId: adrielly.id,
        titulo: "Concluir o semestre com média acima de 8",
        prazo: new Date("2025-07-01"),
        progressoPct: 65,
        concluida: false,
      },
      {
        usuarioId: adrielly.id,
        titulo: "Economizar R$ 500 por mês",
        prazo: new Date("2025-12-31"),
        progressoPct: 40,
        concluida: false,
      },
    ],
  });
  console.log("✅ Metas criadas");

  // ─── Finanças ──────────────────────────────────────────────────────────
  await prisma.financa.createMany({
    data: [
      {
        usuarioId: adrielly.id,
        tipo: "entrada",
        valor: 1500.0,
        descricao: "Salário estágio",
        data: new Date("2025-05-05"),
      },
      {
        usuarioId: adrielly.id,
        tipo: "saida",
        valor: 120.0,
        descricao: "Transporte",
        data: new Date("2025-05-06"),
      },
      {
        usuarioId: adrielly.id,
        tipo: "saida",
        valor: 350.0,
        descricao: "Alimentação",
        data: new Date("2025-05-07"),
      },
      {
        usuarioId: adrielly.id,
        tipo: "entrada",
        valor: 200.0,
        descricao: "Freelance",
        data: new Date("2025-05-10"),
      },
    ],
  });
  console.log("✅ Finanças criadas");

  const financas = await prisma.financa.findMany({
    where: { usuarioId: adrielly.id },
  });
  const saldo = financas.reduce((acc, f) => {
    return f.tipo === "entrada" ? acc + f.valor : acc - f.valor;
  }, 0);
  console.log(`\n💰 Saldo calculado: R$ ${saldo.toFixed(2)}`);

  console.log("\n🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
