# MenteLeve — API REST

API de organização pessoal para tarefas, hábitos, metas e finanças.
Desenvolvida em Node.js + Express com banco SQLite via Prisma ORM.

---

## Instalação rápida

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js   # opcional: dados de exemplo
npm run dev
```

Servidor disponível em `http://localhost:3000`.

---

## Autenticação

Todas as rotas `/api/*` exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido via `POST /auth/registrar` ou `POST /auth/login`.

---

## Endpoints

### Auth
| Método | Rota               | Descrição              |
|--------|--------------------|------------------------|
| POST   | /auth/registrar    | Cria conta             |
| POST   | /auth/login        | Autentica e retorna token |

### Tarefas
| Método | Rota                        | Descrição                    |
|--------|-----------------------------|------------------------------|
| GET    | /api/tarefas                | Lista tarefas do usuário     |
| POST   | /api/tarefas                | Cria tarefa                  |
| GET    | /api/tarefas/:id            | Busca tarefa por ID          |
| PUT    | /api/tarefas/:id            | Atualiza tarefa completa     |
| PATCH  | /api/tarefas/:id            | Atualiza tarefa parcialmente |
| PATCH  | /api/tarefas/:id/concluir   | Marca como concluída         |
| DELETE | /api/tarefas/:id            | Remove tarefa                |

### Hábitos
| Método | Rota                              | Descrição                        |
|--------|-----------------------------------|----------------------------------|
| GET    | /api/habitos                      | Lista hábitos do usuário         |
| POST   | /api/habitos                      | Cria hábito                      |
| GET    | /api/habitos/:id                  | Busca hábito com registros       |
| PUT    | /api/habitos/:id                  | Atualiza hábito                  |
| DELETE | /api/habitos/:id                  | Remove hábito                    |
| GET    | /api/habitos/:id/registros        | Lista registros do hábito        |
| POST   | /api/habitos/:id/registros        | Registra conclusão em uma data   |
| PATCH  | /api/habitos/registros/:id        | Atualiza status de um registro   |

### Metas
| Método | Rota                        | Descrição                              |
|--------|-----------------------------|----------------------------------------|
| GET    | /api/metas                  | Lista metas do usuário                 |
| POST   | /api/metas                  | Cria meta                              |
| GET    | /api/metas/:id              | Busca meta por ID                      |
| PUT    | /api/metas/:id              | Atualiza meta completa                 |
| PATCH  | /api/metas/:id/progresso    | Atualiza progresso (auto-conclui 100%) |
| DELETE | /api/metas/:id              | Remove meta                            |

### Finanças
| Método | Rota                | Descrição                          |
|--------|---------------------|------------------------------------|
| GET    | /api/financas       | Lista movimentações do usuário     |
| POST   | /api/financas       | Registra movimentação              |
| GET    | /api/financas/saldo | Retorna saldo calculado            |
| GET    | /api/financas/:id   | Busca movimentação por ID          |
| PUT    | /api/financas/:id   | Atualiza movimentação              |
| DELETE | /api/financas/:id   | Remove movimentação                |

---

## Estrutura do projeto

```
menteleve/
├── src/
│   ├── server.js               # Ponto de entrada
│   ├── prismaClient.js         # Singleton do Prisma
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tarefas.js
│   │   ├── habitos.js
│   │   ├── metas.js
│   │   ├── financas.js
│   │   └── usuarios.js
│   └── middleware/
│       └── auth.js             # Middleware autenticar()
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── dev.db                  # Gerado (não versionado)
├── specs/
│   ├── features/               # Specs por domínio (SDD)
│   └── openapi.yaml            # Contrato da API
├── tests/
│   ├── integration/            # Testes de rota com supertest
│   └── __fixtures__/           # Helpers de teste
├── .env                        # DATABASE_URL (não versionado)
└── package.json
```

---

## Scripts

| Comando                 | O que faz                                      |
|-------------------------|------------------------------------------------|
| `npm run dev`           | Servidor com hot-reload (nodemon)              |
| `npm start`             | Servidor em produção                           |
| `npm test`              | Roda todos os testes (sequencial)              |
| `npm run test:coverage` | Testes com relatório de cobertura              |
| `npm run db:migrate`    | Aplica migrações pendentes                     |
| `npm run db:seed`       | Popula banco com dados de exemplo              |
| `npm run db:studio`     | Abre Prisma Studio em localhost:5555           |
| `npm run db:reset`      | Apaga e recria o banco do zero                 |
| `npm run lint`          | Verifica estilo do código                      |

---

## Regras de negócio

- **Isolamento por usuário**: toda rota `/api/*` filtra por `usuarioId = req.usuarioId`
- **Ownership**: GET/PUT/DELETE por ID verificam se o recurso pertence ao usuário autenticado (403 caso contrário)
- **Hábito por dia**: `@@unique([habitoId, data])` impede registro duplicado
- **Saldo dinâmico**: calculado em tempo real como `Σ entradas − Σ saídas`
- **Auto-conclusão de meta**: `PATCH /progresso` com `progressoPct = 100` seta `concluida = true`

---

## Metodologia: SDD (Spec Driven Development)

```
1. SPEC    →  specs/features/<domínio>.md
2. TESTE   →  tests/integration/<domínio>.test.js  (RED)
3. IMPL    →  src/routes/<domínio>.js               (GREEN)
4. REFATOR →  limpar sem quebrar testes
```
