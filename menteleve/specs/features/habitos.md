# Spec: Hábitos

## Domínio
Hábitos recorrentes do usuário. Toda rota exige `Authorization: Bearer <token>`.

## Endpoints

### GET /api/habitos
Lista hábitos do usuário, ordenados por `criadoEm` decrescente.
Inclui últimos 7 registros de cada hábito.

**Query params opcionais:**
- `frequencia=diaria|semanal`

**Resposta `200`:** array com `registros` embutidos

### GET /api/habitos/:id
Busca hábito pelo ID, inclui todos os registros.

**Respostas:**
- `200` — hábito com registros
- `404` — `{ erro: "Hábito não encontrado" }`

### POST /api/habitos
Cria um novo hábito.

**Body obrigatório:** `nome`, `frequencia` (`diaria` | `semanal`)

**Respostas:**
- `201` — hábito criado
- `400` — campos faltando ou frequencia inválida

### PUT /api/habitos/:id
Atualiza nome e/ou frequência do hábito.

**Respostas:**
- `200` — hábito atualizado
- `400` — frequencia inválida
- `404` — `{ erro: "Hábito não encontrado" }`

### DELETE /api/habitos/:id
Remove hábito (cascade em registros).

**Respostas:**
- `200` — `{ mensagem: "Hábito removido com sucesso" }`
- `404` — `{ erro: "Hábito não encontrado" }`

### GET /api/habitos/:id/registros
Lista todos os registros de um hábito, ordenados por `data` decrescente.

### POST /api/habitos/:id/registros
Registra conclusão de um hábito em uma data.

**Body obrigatório:** `data` (ISO 8601)
**Body opcional:** `concluido` (boolean, default `false`)

**Respostas:**
- `201` — registro criado
- `400` — data ausente
- `409` — já existe registro para esse hábito nessa data

### PATCH /api/habitos/registros/:registroId
Atualiza o campo `concluido` de um registro.

**Body obrigatório:** `concluido` (boolean)

**Respostas:**
- `200` — registro atualizado
- `400` — campo ausente
- `404` — `{ erro: "Registro não encontrado" }`

## Modelo
```
habito:
  id, usuarioId, nome, frequencia (diaria|semanal), criadoEm

registroHabito:
  id, habitoId, data, concluido
  UNIQUE(habitoId, data)
```
