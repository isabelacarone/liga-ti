const request = require("supertest");
const app = require("../../src/server");
const { criarUsuario, limparBanco } = require("../__fixtures__/helpers");

let token;
let usuarioId;
let tokenOutro;

beforeAll(limparBanco);
beforeEach(async () => {
  await limparBanco();
  const { usuario, token: t } = await criarUsuario();
  token = t;
  usuarioId = usuario.id;
  const { token: t2 } = await criarUsuario({ email: `outro_${Date.now()}@test.com` });
  tokenOutro = t2;
});
afterAll(limparBanco);

const auth = (t = token) => ({ Authorization: `Bearer ${t}` });

async function criarMeta(dados = {}, t = token) {
  return request(app)
    .post("/api/metas")
    .set(auth(t))
    .send({ titulo: "Meta padrão", prazo: "2026-12-31T00:00:00.000Z", ...dados });
}

describe("GET /api/metas", () => {
  it("retorna lista vazia inicialmente", async () => {
    const res = await request(app).get("/api/metas").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("não lista metas de outro usuário", async () => {
    await criarMeta({ titulo: "Minha meta" });
    await criarMeta({ titulo: "Meta do outro" }, tokenOutro);

    const res = await request(app).get("/api/metas").set(auth());
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe("Minha meta");
  });

  it("filtra por concluida=false", async () => {
    await criarMeta({ titulo: "Em andamento" });
    const concluida = await criarMeta({ titulo: "Concluída" });
    await request(app)
      .patch(`/api/metas/${concluida.body.id}/progresso`)
      .set(auth())
      .send({ progressoPct: 100 });

    const res = await request(app).get("/api/metas?concluida=false").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe("Em andamento");
  });
});

describe("POST /api/metas", () => {
  it("cria meta com titulo e prazo", async () => {
    const res = await criarMeta({ titulo: "Aprender Node.js" });
    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe("Aprender Node.js");
    expect(res.body.progressoPct).toBe(0);
    expect(res.body.concluida).toBe(false);
    expect(res.body.usuarioId).toBe(usuarioId);
  });

  it("cria meta com progressoPct inicial", async () => {
    const res = await criarMeta({ progressoPct: 50 });
    expect(res.status).toBe(201);
    expect(res.body.progressoPct).toBe(50);
  });

  it("marca concluida=true ao criar com progressoPct=100", async () => {
    const res = await criarMeta({ progressoPct: 100 });
    expect(res.status).toBe(201);
    expect(res.body.concluida).toBe(true);
  });

  it("retorna 400 sem campos obrigatórios", async () => {
    const res = await request(app).post("/api/metas").set(auth()).send({ titulo: "Sem prazo" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 com progressoPct fora do intervalo", async () => {
    const res = await criarMeta({ progressoPct: 150 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/metas/:id", () => {
  it("retorna meta do próprio usuário", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app).get(`/api/metas/${meta.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(meta.id);
  });

  it("retorna 403 ao acessar meta de outro usuário", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app).get(`/api/metas/${meta.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).get("/api/metas/nao-existe").set(auth());
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/metas/:id", () => {
  it("atualiza todos os campos", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app)
      .put(`/api/metas/${meta.id}`)
      .set(auth())
      .send({ titulo: "Atualizado", prazo: "2027-06-01T00:00:00.000Z", progressoPct: 30, concluida: false });
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe("Atualizado");
    expect(res.body.progressoPct).toBe(30);
  });

  it("auto-conclui quando progressoPct=100 no PUT", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app)
      .put(`/api/metas/${meta.id}`)
      .set(auth())
      .send({ titulo: meta.titulo, prazo: meta.prazo, progressoPct: 100, concluida: false });
    expect(res.status).toBe(200);
    expect(res.body.concluida).toBe(true);
  });

  it("retorna 403 ao editar meta de outro usuário", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app).put(`/api/metas/${meta.id}`).set(auth(tokenOutro)).send({ titulo: "X" });
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).put("/api/metas/nao-existe").set(auth()).send({ titulo: "X" });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/metas/:id/progresso", () => {
  it("atualiza progresso da meta", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app)
      .patch(`/api/metas/${meta.id}/progresso`)
      .set(auth())
      .send({ progressoPct: 75 });
    expect(res.status).toBe(200);
    expect(res.body.progressoPct).toBe(75);
    expect(res.body.concluida).toBe(false);
  });

  it("marca concluida=true quando progressoPct=100", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app)
      .patch(`/api/metas/${meta.id}/progresso`)
      .set(auth())
      .send({ progressoPct: 100 });
    expect(res.status).toBe(200);
    expect(res.body.concluida).toBe(true);
  });

  it("retorna 403 ao editar progresso de meta de outro usuário", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app)
      .patch(`/api/metas/${meta.id}/progresso`)
      .set(auth(tokenOutro))
      .send({ progressoPct: 50 });
    expect(res.status).toBe(403);
  });

  it("retorna 400 com progressoPct fora do intervalo", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app)
      .patch(`/api/metas/${meta.id}/progresso`)
      .set(auth())
      .send({ progressoPct: -5 });
    expect(res.status).toBe(400);
  });

  it("retorna 400 sem progressoPct", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app).patch(`/api/metas/${meta.id}/progresso`).set(auth()).send({});
    expect(res.status).toBe(400);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).patch("/api/metas/nao-existe/progresso").set(auth()).send({ progressoPct: 50 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/metas/:id", () => {
  it("remove meta existente", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app).delete(`/api/metas/${meta.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensagem");
  });

  it("retorna 403 ao deletar meta de outro usuário", async () => {
    const { body: meta } = await criarMeta();
    const res = await request(app).delete(`/api/metas/${meta.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).delete("/api/metas/nao-existe").set(auth());
    expect(res.status).toBe(404);
  });
});
