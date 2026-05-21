# 🧠 MenteLeve – API REST

> API REST para o projeto MenteLeve — gerenciador de tarefas, hábitos, metas e finanças.

---

## 🚀 Como rodar

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure o banco de dados
```bash
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js   # opcional: popula com dados de exemplo
```

### 3. Inicie o servidor
```bash
npm start          # produção
npm run dev        # desenvolvimento (hot reload com nodemon)
```

Servidor disponível em: **http://localhost:3000**

---

## 📋 Endpoints

### 👤 Usuários — `/api/usuarios`

| Método | Rota                  | Descrição                          |
|--------|-----------------------|------------------------------------|
| GET    | `/api/usuarios`       | Lista todos os usuários            |
| GET    | `/api/usuarios/:id`   | Busca usuário por ID               |
| POST   | `/api/usuarios`       | Cria novo usuário                  |
| PUT    | `/api/usuarios/:id`   | Atualiza dados do usuário          |
| DELETE | `/api/usuarios/:id`   | Remove usuário (cascata nos dados) |

**POST /api/usuarios** — body:
```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senhaHash": "$2b$10$...",
  "premium": false
}
```

---

### ✅ Tarefas — `/api/tarefas`

| Método | Rota                          | Descrição                        |
|--------|-------------------------------|----------------------------------|
| GET    | `/api/tarefas?usuarioId=xxx`  | Lista tarefas (filtra por status)|
| GET    | `/api/tarefas/:id`            | Busca tarefa por ID              |
| POST   | `/api/tarefas`                | Cria nova tarefa                 |
| PUT    | `/api/tarefas/:id`            | Atualiza tarefa                  |
| PATCH  | `/api/tarefas/:id/concluir`   | Marca tarefa como concluída      |
| DELETE | `/api/tarefas/:id`            | Remove tarefa                    |

**Query params opcionais (GET):** `concluida=true|false`

**POST /api/tarefas** — body:
```json
{
  "usuarioId": "uuid",
  "titulo": "Estudar para a prova",
  "dataPrevista": "2026-05-20T00:00:00.000Z"
}
```

---

### 🔄 Hábitos — `/api/habitos`

| Método | Rota                               | Descrição                            |
|--------|------------------------------------|--------------------------------------|
| GET    | `/api/habitos?usuarioId=xxx`       | Lista hábitos (com últimos registros)|
| GET    | `/api/habitos/:id`                 | Busca hábito por ID                  |
| POST   | `/api/habitos`                     | Cria novo hábito                     |
| PUT    | `/api/habitos/:id`                 | Atualiza hábito                      |
| DELETE | `/api/habitos/:id`                 | Remove hábito                        |
| GET    | `/api/habitos/:id/registros`       | Lista registros do hábito            |
| POST   | `/api/habitos/:id/registros`       | Registra conclusão em uma data       |
| PATCH  | `/api/habitos/registros/:regId`    | Atualiza status de um registro       |

**Query params opcionais (GET):** `frequencia=diaria|semanal`

**POST /api/habitos** — body:
```json
{
  "usuarioId": "uuid",
  "nome": "Beber 2L de água",
  "frequencia": "diaria"
}
```

**POST /api/habitos/:id/registros** — body:
```json
{
  "data": "2026-05-05T00:00:00.000Z",
  "concluido": true
}
```

---

### 🎯 Metas — `/api/metas`

| Método | Rota                          | Descrição                          |
|--------|-------------------------------|------------------------------------|
| GET    | `/api/metas?usuarioId=xxx`    | Lista metas                        |
| GET    | `/api/metas/:id`              | Busca meta por ID                  |
| POST   | `/api/metas`                  | Cria nova meta                     |
| PUT    | `/api/metas/:id`              | Atualiza meta                      |
| PATCH  | `/api/metas/:id/progresso`    | Atualiza progresso (0–100)         |
| DELETE | `/api/metas/:id`              | Remove meta                        |

**Query params opcionais (GET):** `concluida=true|false`

**PATCH /api/metas/:id/progresso** — body:
```json
{ "progressoPct": 75 }
```
> Quando `progressoPct` chega a 100, a meta é marcada como `concluida: true` automaticamente.

---

### 💰 Finanças — `/api/financas`

| Método | Rota                                  | Descrição                        |
|--------|---------------------------------------|----------------------------------|
| GET    | `/api/financas?usuarioId=xxx`         | Lista movimentações              |
| GET    | `/api/financas/saldo?usuarioId=xxx`   | Retorna saldo calculado          |
| GET    | `/api/financas/:id`                   | Busca movimentação por ID        |
| POST   | `/api/financas`                       | Registra movimentação            |
| PUT    | `/api/financas/:id`                   | Atualiza movimentação            |
| DELETE | `/api/financas/:id`                   | Remove movimentação              |

**Query params opcionais (GET):** `tipo=entrada|saida`

**GET /api/financas/saldo** — resposta:
```json
{
  "usuarioId": "uuid",
  "totalEntradas": 1700.00,
  "totalSaidas": 470.00,
  "saldo": 1230.00
}
```

**POST /api/financas** — body:
```json
{
  "usuarioId": "uuid",
  "tipo": "entrada",
  "valor": 1500.00,
  "descricao": "Salário",
  "data": "2026-05-05T00:00:00.000Z"
}
```

---

## 📁 Estrutura do projeto

```
menteleve/
├── prisma/
│   ├── schema.prisma      ← Modelagem das tabelas
│   ├── seed.js            ← Dados de exemplo
│   └── dev.db             ← Banco SQLite (gerado automaticamente)
├── src/
│   ├── server.js          ← Ponto de entrada da API
│   ├── prismaClient.js    ← Instância singleton do Prisma
│   └── routes/
│       ├── usuarios.js    ← CRUD de usuários
│       ├── tarefas.js     ← CRUD de tarefas
│       ├── habitos.js     ← CRUD de hábitos + registros
│       ├── metas.js       ← CRUD de metas
│       └── financas.js    ← CRUD de finanças + saldo
├── .env
├── package.json
└── API_README.md
```

---

## ⚙️ Variável de ambiente

`.env`:
```
DATABASE_URL="file:./prisma/dev.db"
```
