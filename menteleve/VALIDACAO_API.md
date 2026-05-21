# 🚨 Validação de Comunicação Frontend/Backend

## Problemas Encontrados

### 1. ❌ **PATCH /api/tarefas/:id** (Não existe no backend)

**Localização do erro:** Frontend em `toggleTarefa()` e `saveTarefa()`

**O que acontece:**

- Frontend envia: `PATCH /api/tarefas/50c8fb7f-341d-4dc0-b4a0-74a1f0233a9c`
- Backend retorna: `Cannot PATCH /api/tarefas/{id}`

**Raiz do problema:**

- Frontend tenta usar `PATCH /tarefas/:id` para atualizar
- Backend só oferece `PUT /api/tarefas/:id` (atualizar) e `PATCH /api/tarefas/:id/concluir` (marcar como concluída)

**Código problemático (index.html, linha ~750):**

```javascript
async function toggleTarefa(id, wasDone) {
  await req("PATCH", `/tarefas/${id}`, { concluida: !wasDone }); // ❌ ERRADO
}

async function saveTarefa() {
  if (id) {
    await req("PATCH", `/tarefas/${id}`, {
      titulo,
      data_prevista: data || null,
    }); // ❌ ERRADO
  }
}
```

---

### 2. ⚠️ **Inconsistência de campo: `data_prevista` vs `dataPrevista`**

**Frontend envia:**

```javascript
{ titulo, data_prevista: data || null }
```

**Backend espera:**

```javascript
data: {
  titulo,
  dataPrevista: dataPrevista ? new Date(dataPrevista) : undefined,
  concluida,
}
```

---

## ✅ Soluções Recomendadas

### Opção A: Ajustar o Backend (Melhor)

Adicionar rota PATCH para `/api/tarefas/:id` que aceita `{ titulo, data_prevista, concluida }`

### Opção B: Ajustar o Frontend

Alterar frontend para usar:

- `PUT /api/tarefas/:id` para atualizações
- `PATCH /api/tarefas/:id/concluir` apenas para marcar como concluída
- Corrigir nome do campo para `dataPrevista`

---

## 📋 Resumo das Rotas

### Backend (tarefas.js)

```
✓ GET    /api/tarefas
✓ GET    /api/tarefas/:id
✓ POST   /api/tarefas
✓ PUT    /api/tarefas/:id         (atualizar - não existe PATCH!)
✓ PATCH  /api/tarefas/:id/concluir (marcar como concluída)
✓ DELETE /api/tarefas/:id
```

### Frontend (esperado)

```
✓ GET    /tarefas
✗ PATCH  /tarefas/:id             (não existe!)
✗ PATCH  /tarefas/:id/concluir    (não é usado no frontend)
✗ PUT    /tarefas/:id             (não é usado no frontend)
```

---

## 🔧 Próximos Passos

1. Decidir entre ajustar backend ou frontend
2. Corrigir inconsistências de nomenclatura de campos
3. Testar comunicação novamente após correção
