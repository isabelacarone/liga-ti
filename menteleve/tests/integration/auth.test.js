const request = require("supertest");
const app = require("../../src/server");
const { limparBanco } = require("../__fixtures__/helpers");

beforeEach(limparBanco);
afterAll(limparBanco);

describe("POST /auth/registrar", () => {
  it("cria usuário e retorna token", async () => {
    const res = await request(app).post("/auth/registrar").send({
      nome: "Ana",
      email: "ana@test.com",
      senha: "senha123",
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.usuario).toMatchObject({ nome: "Ana", email: "ana@test.com" });
  });

  it("retorna 400 quando campos obrigatórios ausentes", async () => {
    const res = await request(app).post("/auth/registrar").send({ email: "x@x.com" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("erro");
  });

  it("retorna 400 para email duplicado", async () => {
    await request(app).post("/auth/registrar").send({ nome: "A", email: "dup@test.com", senha: "123" });
    const res = await request(app).post("/auth/registrar").send({ nome: "B", email: "dup@test.com", senha: "456" });
    expect(res.status).toBe(400);
    expect(res.body.erro).toMatch(/cadastrado/i);
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/auth/registrar").send({ nome: "Bob", email: "bob@test.com", senha: "senha123" });
  });

  it("autentica com credenciais corretas", async () => {
    const res = await request(app).post("/auth/login").send({ email: "bob@test.com", senha: "senha123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.usuario).toHaveProperty("premium");
  });

  it("retorna 401 com senha errada", async () => {
    const res = await request(app).post("/auth/login").send({ email: "bob@test.com", senha: "errada" });
    expect(res.status).toBe(401);
  });

  it("retorna 401 com email inexistente", async () => {
    const res = await request(app).post("/auth/login").send({ email: "nao@existe.com", senha: "123" });
    expect(res.status).toBe(401);
  });

  it("retorna 400 quando campos ausentes", async () => {
    const res = await request(app).post("/auth/login").send({ email: "bob@test.com" });
    expect(res.status).toBe(400);
  });
});

describe("Middleware autenticar", () => {
  it("retorna 401 sem header Authorization", async () => {
    const res = await request(app).get("/api/tarefas");
    expect(res.status).toBe(401);
  });

  it("retorna 401 com token mal-formado", async () => {
    const res = await request(app).get("/api/tarefas").set("Authorization", "Bearer tokeninvalido");
    expect(res.status).toBe(401);
  });
});
