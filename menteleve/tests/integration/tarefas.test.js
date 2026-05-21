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

async function criarTarefa(dados = {}, t = token) {
  return request(app)
    .post("/api/tarefas")
    .set(auth(t))
    .send({ titulo: "Tarefa padrão", ...dados });
}

describe("GET /api/tarefas", () => {
  it("retorna lista vazia inicialmente", async () => {
    const res = await request(app).get("/api/tarefas").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("lista apenas tarefas do usuário autenticado", async () => {
    await criarTarefa({ titulo: "Minha tarefa" });
    await criarTarefa({ titulo: "Tarefa do outro" }, tokenOutro);

    const res = await request(app).get("/api/tarefas").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].titulo).toBe("Minha tarefa");
  });

  it("filtra por concluida=true", async () => {
    await criarTarefa({ titulo: "A" });
    const r2 = await criarTarefa({ titulo: "B" });
    await request(app).patch(`/api/tarefas/${r2.body.id}/concluir`).set(auth());

    const res = await request(app).get("/api/tarefas?concluida=true").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].concluida).toBe(true);
  });
});

describe("POST /api/tarefas", () => {
  it("cria tarefa com titulo", async () => {
    const res = await criarTarefa({ titulo: "Nova tarefa" });
    expect(res.status).toBe(201);
    expect(res.body.titulo).toBe("Nova tarefa");
    expect(res.body.concluida).toBe(false);
    expect(res.body.usuarioId).toBe(usuarioId);
  });

  it("cria tarefa com dataPrevista", async () => {
    const res = await criarTarefa({ titulo: "Com data", dataPrevista: "2026-12-31T00:00:00.000Z" });
    expect(res.status).toBe(201);
    expect(res.body.dataPrevista).toBeTruthy();
  });

  it("retorna 400 sem titulo", async () => {
    const res = await request(app).post("/api/tarefas").set(auth()).send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("erro");
  });
});

describe("GET /api/tarefas/:id", () => {
  it("retorna tarefa do próprio usuário", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app).get(`/api/tarefas/${tarefa.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(tarefa.id);
  });

  it("retorna 403 ao acessar tarefa de outro usuário", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app).get(`/api/tarefas/${tarefa.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).get("/api/tarefas/id-que-nao-existe").set(auth());
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/tarefas/:id", () => {
  it("atualiza todos os campos da tarefa", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app)
      .put(`/api/tarefas/${tarefa.id}`)
      .set(auth())
      .send({ titulo: "Atualizado", concluida: true });
    expect(res.status).toBe(200);
    expect(res.body.titulo).toBe("Atualizado");
    expect(res.body.concluida).toBe(true);
  });

  it("retorna 403 ao editar tarefa de outro usuário", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app)
      .put(`/api/tarefas/${tarefa.id}`)
      .set(auth(tokenOutro))
      .send({ titulo: "Invasão" });
    expect(res.status).toBe(403);
  });

  it("retorna 404 para tarefa inexistente", async () => {
    const res = await request(app).put("/api/tarefas/inexistente").set(auth()).send({ titulo: "X" });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/tarefas/:id/concluir", () => {
  it("marca tarefa como concluída", async () => {
    const { body: tarefa } = await criarTarefa();
    expect(tarefa.concluida).toBe(false);

    const res = await request(app).patch(`/api/tarefas/${tarefa.id}/concluir`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.concluida).toBe(true);
  });

  it("retorna 403 ao concluir tarefa de outro usuário", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app).patch(`/api/tarefas/${tarefa.id}/concluir`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para tarefa inexistente", async () => {
    const res = await request(app).patch("/api/tarefas/inexistente/concluir").set(auth());
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/tarefas/:id", () => {
  it("atualiza parcialmente a tarefa", async () => {
    const { body: tarefa } = await criarTarefa({ titulo: "Original" });
    const res = await request(app)
      .patch(`/api/tarefas/${tarefa.id}`)
      .set(auth())
      .send({ concluida: true });
    expect(res.status).toBe(200);
    expect(res.body.concluida).toBe(true);
    expect(res.body.titulo).toBe("Original");
  });

  it("retorna 403 ao editar tarefa de outro usuário", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app)
      .patch(`/api/tarefas/${tarefa.id}`)
      .set(auth(tokenOutro))
      .send({ concluida: true });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/tarefas/:id", () => {
  it("remove tarefa existente", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app).delete(`/api/tarefas/${tarefa.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensagem");
  });

  it("retorna 403 ao deletar tarefa de outro usuário", async () => {
    const { body: tarefa } = await criarTarefa();
    const res = await request(app).delete(`/api/tarefas/${tarefa.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para tarefa inexistente", async () => {
    const res = await request(app).delete("/api/tarefas/inexistente").set(auth());
    expect(res.status).toBe(404);
  });
});
