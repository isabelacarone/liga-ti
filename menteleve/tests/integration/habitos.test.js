const request = require("supertest");
const app = require("../../src/server");
const { criarUsuario, limparBanco } = require("../__fixtures__/helpers");

let token;
let tokenOutro;

beforeAll(limparBanco);
beforeEach(async () => {
  await limparBanco();
  const { token: t } = await criarUsuario();
  token = t;
  const { token: t2 } = await criarUsuario({ email: `outro_${Date.now()}@test.com` });
  tokenOutro = t2;
});
afterAll(limparBanco);

const auth = (t = token) => ({ Authorization: `Bearer ${t}` });

async function criarHabito(dados = {}, t = token) {
  return request(app)
    .post("/api/habitos")
    .set(auth(t))
    .send({ nome: "Leitura", frequencia: "diaria", ...dados });
}

describe("GET /api/habitos", () => {
  it("retorna lista vazia inicialmente", async () => {
    const res = await request(app).get("/api/habitos").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("lista hábitos com registros embutidos", async () => {
    await criarHabito({ nome: "Exercício" });
    const res = await request(app).get("/api/habitos").set(auth());
    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("registros");
  });

  it("não lista hábitos de outro usuário", async () => {
    await criarHabito({ nome: "Meu hábito" });
    await criarHabito({ nome: "Hábito do outro" }, tokenOutro);

    const res = await request(app).get("/api/habitos").set(auth());
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nome).toBe("Meu hábito");
  });

  it("filtra por frequencia", async () => {
    await criarHabito({ nome: "Diário", frequencia: "diaria" });
    await criarHabito({ nome: "Semanal", frequencia: "semanal" });

    const res = await request(app).get("/api/habitos?frequencia=semanal").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].frequencia).toBe("semanal");
  });
});

describe("POST /api/habitos", () => {
  it("cria hábito com nome e frequência", async () => {
    const res = await criarHabito({ nome: "Meditação", frequencia: "diaria" });
    expect(res.status).toBe(201);
    expect(res.body.nome).toBe("Meditação");
    expect(res.body.frequencia).toBe("diaria");
  });

  it("retorna 400 sem campos obrigatórios", async () => {
    const res = await request(app).post("/api/habitos").set(auth()).send({ nome: "Só nome" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 com frequencia inválida", async () => {
    const res = await criarHabito({ frequencia: "mensal" });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/habitos/:id", () => {
  it("retorna hábito do próprio usuário com registros", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app).get(`/api/habitos/${habito.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(habito.id);
    expect(res.body).toHaveProperty("registros");
  });

  it("retorna 403 ao acessar hábito de outro usuário", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app).get(`/api/habitos/${habito.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).get("/api/habitos/nao-existe").set(auth());
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/habitos/:id", () => {
  it("atualiza nome e frequência", async () => {
    const { body: habito } = await criarHabito({ nome: "Original", frequencia: "diaria" });
    const res = await request(app)
      .put(`/api/habitos/${habito.id}`)
      .set(auth())
      .send({ nome: "Atualizado", frequencia: "semanal" });
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Atualizado");
    expect(res.body.frequencia).toBe("semanal");
  });

  it("retorna 403 ao editar hábito de outro usuário", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app).put(`/api/habitos/${habito.id}`).set(auth(tokenOutro)).send({ nome: "X" });
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).put("/api/habitos/nao-existe").set(auth()).send({ nome: "X" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/habitos/:id", () => {
  it("remove hábito", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app).delete(`/api/habitos/${habito.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensagem");
  });

  it("retorna 403 ao deletar hábito de outro usuário", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app).delete(`/api/habitos/${habito.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).delete("/api/habitos/nao-existe").set(auth());
    expect(res.status).toBe(404);
  });
});

describe("GET /api/habitos/:id/registros", () => {
  it("lista registros do hábito", async () => {
    const { body: habito } = await criarHabito();
    await request(app)
      .post(`/api/habitos/${habito.id}/registros`)
      .set(auth())
      .send({ data: "2026-05-21T00:00:00.000Z" });

    const res = await request(app).get(`/api/habitos/${habito.id}/registros`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("retorna 403 ao listar registros de hábito de outro usuário", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app).get(`/api/habitos/${habito.id}/registros`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/habitos/:id/registros", () => {
  it("registra conclusão de hábito em uma data", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app)
      .post(`/api/habitos/${habito.id}/registros`)
      .set(auth())
      .send({ data: "2026-05-21T00:00:00.000Z", concluido: true });
    expect(res.status).toBe(201);
    expect(res.body.concluido).toBe(true);
    expect(res.body.habitoId).toBe(habito.id);
  });

  it("retorna 400 sem data", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app)
      .post(`/api/habitos/${habito.id}/registros`)
      .set(auth())
      .send({ concluido: true });
    expect(res.status).toBe(400);
  });

  it("retorna 403 ao registrar em hábito de outro usuário", async () => {
    const { body: habito } = await criarHabito();
    const res = await request(app)
      .post(`/api/habitos/${habito.id}/registros`)
      .set(auth(tokenOutro))
      .send({ data: "2026-05-21T00:00:00.000Z" });
    expect(res.status).toBe(403);
  });

  it("retorna 409 para data duplicada no mesmo hábito", async () => {
    const { body: habito } = await criarHabito();
    const payload = { data: "2026-05-21T00:00:00.000Z" };
    await request(app).post(`/api/habitos/${habito.id}/registros`).set(auth()).send(payload);
    const res = await request(app).post(`/api/habitos/${habito.id}/registros`).set(auth()).send(payload);
    expect(res.status).toBe(409);
  });
});

describe("PATCH /api/habitos/registros/:registroId", () => {
  it("atualiza status de conclusão do registro", async () => {
    const { body: habito } = await criarHabito();
    const { body: registro } = await request(app)
      .post(`/api/habitos/${habito.id}/registros`)
      .set(auth())
      .send({ data: "2026-05-21T00:00:00.000Z", concluido: false });

    const res = await request(app)
      .patch(`/api/habitos/registros/${registro.id}`)
      .set(auth())
      .send({ concluido: true });
    expect(res.status).toBe(200);
    expect(res.body.concluido).toBe(true);
  });

  it("retorna 403 ao editar registro de outro usuário", async () => {
    const { body: habito } = await criarHabito();
    const { body: registro } = await request(app)
      .post(`/api/habitos/${habito.id}/registros`)
      .set(auth())
      .send({ data: "2026-05-21T00:00:00.000Z" });

    const res = await request(app)
      .patch(`/api/habitos/registros/${registro.id}`)
      .set(auth(tokenOutro))
      .send({ concluido: true });
    expect(res.status).toBe(403);
  });

  it("retorna 400 sem campo concluido", async () => {
    const { body: habito } = await criarHabito();
    const { body: registro } = await request(app)
      .post(`/api/habitos/${habito.id}/registros`)
      .set(auth())
      .send({ data: "2026-05-20T00:00:00.000Z" });

    const res = await request(app)
      .patch(`/api/habitos/registros/${registro.id}`)
      .set(auth())
      .send({});
    expect(res.status).toBe(400);
  });
});
