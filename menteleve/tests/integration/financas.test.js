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

async function criarMovimentacao(dados = {}, t = token) {
  return request(app)
    .post("/api/financas")
    .set(auth(t))
    .send({ tipo: "entrada", valor: 100, data: "2026-05-21T00:00:00.000Z", ...dados });
}

describe("GET /api/financas", () => {
  it("retorna lista vazia inicialmente", async () => {
    const res = await request(app).get("/api/financas").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("não lista movimentações de outro usuário", async () => {
    await criarMovimentacao({ valor: 100 });
    await criarMovimentacao({ valor: 200 }, tokenOutro);

    const res = await request(app).get("/api/financas").set(auth());
    expect(res.body).toHaveLength(1);
    expect(res.body[0].valor).toBe(100);
  });

  it("filtra por tipo=saida", async () => {
    await criarMovimentacao({ tipo: "entrada", valor: 200 });
    await criarMovimentacao({ tipo: "saida", valor: 50 });

    const res = await request(app).get("/api/financas?tipo=saida").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].tipo).toBe("saida");
  });

  it("retorna 400 com tipo inválido", async () => {
    const res = await request(app).get("/api/financas?tipo=invalido").set(auth());
    expect(res.status).toBe(400);
  });
});

describe("GET /api/financas/saldo", () => {
  it("retorna saldo zerado sem movimentações", async () => {
    const res = await request(app).get("/api/financas/saldo").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.saldo).toBe(0);
    expect(res.body.totalEntradas).toBe(0);
    expect(res.body.totalSaidas).toBe(0);
  });

  it("calcula saldo corretamente sem misturar usuários", async () => {
    await criarMovimentacao({ tipo: "entrada", valor: 500 });
    await criarMovimentacao({ tipo: "entrada", valor: 300 });
    await criarMovimentacao({ tipo: "saida", valor: 200 });
    await criarMovimentacao({ tipo: "entrada", valor: 999 }, tokenOutro);

    const res = await request(app).get("/api/financas/saldo").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.totalEntradas).toBe(800);
    expect(res.body.totalSaidas).toBe(200);
    expect(res.body.saldo).toBe(600);
  });
});

describe("POST /api/financas", () => {
  it("cria movimentação de entrada", async () => {
    const res = await criarMovimentacao({ tipo: "entrada", valor: 1000, descricao: "Salário" });
    expect(res.status).toBe(201);
    expect(res.body.tipo).toBe("entrada");
    expect(res.body.valor).toBe(1000);
    expect(res.body.descricao).toBe("Salário");
    expect(res.body.usuarioId).toBe(usuarioId);
  });

  it("cria movimentação de saída", async () => {
    const res = await criarMovimentacao({ tipo: "saida", valor: 50 });
    expect(res.status).toBe(201);
    expect(res.body.tipo).toBe("saida");
  });

  it("retorna 400 sem campos obrigatórios", async () => {
    const res = await request(app).post("/api/financas").set(auth()).send({ tipo: "entrada" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 com tipo inválido", async () => {
    const res = await criarMovimentacao({ tipo: "investimento" });
    expect(res.status).toBe(400);
  });

  it("retorna 400 com valor <= 0", async () => {
    const res = await criarMovimentacao({ valor: 0 });
    expect(res.status).toBe(400);
  });

  it("retorna 400 com valor negativo", async () => {
    const res = await criarMovimentacao({ valor: -100 });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/financas/:id", () => {
  it("retorna movimentação do próprio usuário", async () => {
    const { body: mov } = await criarMovimentacao();
    const res = await request(app).get(`/api/financas/${mov.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(mov.id);
  });

  it("retorna 403 ao acessar movimentação de outro usuário", async () => {
    const { body: mov } = await criarMovimentacao();
    const res = await request(app).get(`/api/financas/${mov.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).get("/api/financas/nao-existe").set(auth());
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/financas/:id", () => {
  it("atualiza movimentação", async () => {
    const { body: mov } = await criarMovimentacao({ tipo: "entrada", valor: 100 });
    const res = await request(app)
      .put(`/api/financas/${mov.id}`)
      .set(auth())
      .send({ tipo: "saida", valor: 200, data: "2026-06-01T00:00:00.000Z" });
    expect(res.status).toBe(200);
    expect(res.body.tipo).toBe("saida");
    expect(res.body.valor).toBe(200);
  });

  it("retorna 403 ao editar movimentação de outro usuário", async () => {
    const { body: mov } = await criarMovimentacao();
    const res = await request(app).put(`/api/financas/${mov.id}`).set(auth(tokenOutro)).send({ tipo: "saida" });
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).put("/api/financas/nao-existe").set(auth()).send({ tipo: "entrada" });
    expect(res.status).toBe(404);
  });

  it("retorna 400 com valor <= 0 na atualização", async () => {
    const { body: mov } = await criarMovimentacao();
    const res = await request(app).put(`/api/financas/${mov.id}`).set(auth()).send({ valor: -50 });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/financas/:id", () => {
  it("remove movimentação", async () => {
    const { body: mov } = await criarMovimentacao();
    const res = await request(app).delete(`/api/financas/${mov.id}`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("mensagem");
  });

  it("retorna 403 ao deletar movimentação de outro usuário", async () => {
    const { body: mov } = await criarMovimentacao();
    const res = await request(app).delete(`/api/financas/${mov.id}`).set(auth(tokenOutro));
    expect(res.status).toBe(403);
  });

  it("retorna 404 para id inexistente", async () => {
    const res = await request(app).delete("/api/financas/nao-existe").set(auth());
    expect(res.status).toBe(404);
  });
});
