# Spec: Tarefas

## Domínio
Atividades criadas por usuários autenticados. Toda rota exige `Authorization: Bearer <token>`.

## Endpoints

### GET /api/tarefas
Lista tarefas do usuário autenticado, ordenadas por `dataPrevista` ascendente.

**Query params opcionais:**
- `concluida=true|false` — filtra por status

**Resposta `200`:** array de tarefas

### GET /api/tarefas/:id
Busca tarefa pelo ID. **Issue conhecida:** não valida ownership (qualquer usuário autenticado pode ver).

**Respostas:**
- `200` — tarefa encontrada
- `404` — `{ erro: "Tarefa não encontrada" }`

### POST /api/tarefas
Cria uma nova tarefa para o usuário autenticado.

**Body obrigatório:** `titulo`
**Body opcional:** `dataPrevista` (ISO 8601)

**Respostas:**
- `201` — tarefa criada
- `400` — `{ erro: "Campos obrigatórios: titulo" }`

### PUT /api/tarefas/:id
Substitui os campos de uma tarefa.

**Campos:** `titulo`, `dataPrevista`, `concluida`

**Respostas:**
- `200` — tarefa atualizada
- `404` — `{ erro: "Tarefa não encontrada" }`

### PATCH /api/tarefas/:id
Atualização parcial. Aceita `titulo`, `dataPrevista` (ou `data_prevista`), `concluida`.

### PATCH /api/tarefas/:id/concluir
Marca a tarefa como concluída (`concluida = true`).

**Respostas:**
- `200` — tarefa atualizada
- `404` — `{ erro: "Tarefa não encontrada" }`

### DELETE /api/tarefas/:id
Remove a tarefa.

**Respostas:**
- `200` — `{ mensagem: "Tarefa removida com sucesso" }`
- `404` — `{ erro: "Tarefa não encontrada" }`

## Modelo
```
id           uuid
usuarioId    uuid (FK → usuarios)
titulo       string
dataPrevista datetime? 
concluida    boolean (default false)
criadoEm     datetime
```
