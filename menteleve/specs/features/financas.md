# Spec: Finanças

## Domínio
Movimentações financeiras (entradas e saídas). Saldo calculado dinamicamente. Toda rota exige `Authorization: Bearer <token>`.

## Endpoints

### GET /api/financas
Lista movimentações do usuário, ordenadas por `data` decrescente.

**Query params opcionais:**
- `tipo=entrada|saida`

**Respostas:**
- `200` — array de movimentações
- `400` — tipo inválido

### GET /api/financas/saldo
Retorna saldo calculado: `entradas - saídas`.

**Resposta `200`:**
```json
{ "usuarioId": "...", "totalEntradas": 0, "totalSaidas": 0, "saldo": 0 }
```

### GET /api/financas/:id
Busca movimentação pelo ID.

**Respostas:**
- `200` — movimentação encontrada
- `404` — `{ erro: "Movimentação não encontrada" }`

### POST /api/financas
Registra nova movimentação.

**Body obrigatório:** `tipo` (`entrada`|`saida`), `valor` (> 0), `data` (ISO 8601)
**Body opcional:** `descricao`

**Respostas:**
- `201` — movimentação criada
- `400` — campos faltando, tipo inválido ou valor ≤ 0

### PUT /api/financas/:id
Atualiza uma movimentação.

**Campos:** `tipo`, `valor`, `descricao`, `data`

**Respostas:**
- `200` — movimentação atualizada
- `400` — tipo inválido ou valor ≤ 0
- `404` — `{ erro: "Movimentação não encontrada" }`

### DELETE /api/financas/:id
Remove a movimentação.

**Respostas:**
- `200` — `{ mensagem: "Movimentação removida com sucesso" }`
- `404` — `{ erro: "Movimentação não encontrada" }`

## Modelo
```
id, usuarioId, tipo (entrada|saida), valor (float > 0), descricao?, data, criadoEm
```

## Regras de negócio
- `valor` deve ser maior que zero
- Saldo = Σ entradas − Σ saídas (calculado em tempo real, sem campo persistido)
- `GET /saldo` retorna zeros quando não há movimentações
