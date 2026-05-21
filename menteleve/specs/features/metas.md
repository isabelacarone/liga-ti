# Spec: Metas

## Domínio
Objetivos com prazo e acompanhamento de progresso. Toda rota exige `Authorization: Bearer <token>`.

## Endpoints

### GET /api/metas
Lista metas do usuário, ordenadas por `prazo` ascendente.

**Query params opcionais:**
- `concluida=true|false`

**Resposta `200`:** array de metas

### GET /api/metas/:id
Busca meta pelo ID.

**Respostas:**
- `200` — meta encontrada
- `404` — `{ erro: "Meta não encontrada" }`

### POST /api/metas
Cria uma nova meta.

**Body obrigatório:** `titulo`, `prazo` (ISO 8601)
**Body opcional:** `progressoPct` (0–100, default 0)

**Respostas:**
- `201` — meta criada
- `400` — campos faltando ou `progressoPct` fora do intervalo

### PUT /api/metas/:id
Atualiza todos os campos de uma meta.

**Campos:** `titulo`, `prazo`, `progressoPct`, `concluida`

**Respostas:**
- `200` — meta atualizada
- `400` — `progressoPct` fora do intervalo
- `404` — `{ erro: "Meta não encontrada" }`

### PATCH /api/metas/:id/progresso
Atualiza apenas o progresso. Se `progressoPct === 100`, seta `concluida = true` automaticamente.

**Body obrigatório:** `progressoPct` (0–100)

**Respostas:**
- `200` — meta atualizada
- `400` — valor ausente ou fora do intervalo
- `404` — `{ erro: "Meta não encontrada" }`

### DELETE /api/metas/:id
Remove a meta.

**Respostas:**
- `200` — `{ mensagem: "Meta removida com sucesso" }`
- `404` — `{ erro: "Meta não encontrada" }`

## Modelo
```
id, usuarioId, titulo, prazo, progressoPct (0–100), concluida, criadoEm
```

## Regras de negócio
- `progressoPct` deve estar entre 0 e 100
- `PATCH /progresso` com `progressoPct = 100` marca `concluida = true` automaticamente
