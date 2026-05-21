# MenteLeve API — CLAUDE.md

API REST em Node.js/Express para organização pessoal (tarefas, hábitos, metas, finanças).
Banco de dados SQLite via Prisma ORM.

## Ambiente

Node.js gerenciado pelo **nvm** (instalado em `~/.nvm`). Para ativar no terminal:
```bash
export NVM_DIR="$HOME/.nvm" && \. "$NVM_DIR/nvm.sh"
```
Ou adicione ao `~/.bashrc` (já foi adicionado pelo instalador).

**Todos os pacotes são locais ao projeto** — nada instalado globalmente.

## Comandos essenciais

```bash
# Desenvolvimento
npm run dev          # servidor com hot-reload (nodemon)
npm start            # servidor em produção

# Banco de dados
npm run db:migrate   # aplica migrações pendentes
npm run db:seed      # popula com dados de exemplo
npm run db:studio    # interface visual do banco

# Testes
npm test             # roda todos os testes
npm run test:watch   # modo watch para TDD
npm run test:coverage

# Lint
npm run lint
```

## Metodologia: SDD (Spec Driven Development)

Todo desenvolvimento segue este fluxo:

```
1. SPEC    →  escrever/atualizar specs/features/<domínio>.md
2. CONTRATO →  atualizar specs/openapi.yaml com o endpoint
3. TESTE   →  escrever teste em tests/integration/<domínio>.test.js (RED)
4. IMPL    →  implementar em src/routes/<domínio>.js (GREEN)
5. REFATOR →  limpar sem quebrar testes (REFACTOR)
```

**Nunca implemente sem spec. Nunca considere pronto sem teste passando.**

### Onde ficam as specs
```
specs/
  openapi.yaml              # contrato oficial da API
  features/
    auth.md                 # regras de autenticação
    tarefas.md
    habitos.md
    metas.md
    financas.md
```

### Onde ficam os testes
```
tests/
  integration/              # testes de rota com supertest
  unit/                     # testes de funções isoladas
  __fixtures__/             # dados de teste reutilizáveis
```

## Estrutura do projeto

```
src/
  server.js                 # ponto de entrada, registro de rotas
  prismaClient.js           # instância singleton do Prisma
  routes/
    auth.js                 # /auth/registrar, /auth/login
    tarefas.js              # /api/tarefas
    habitos.js              # /api/habitos
    metas.js                # /api/metas
    financas.js             # /api/financas
    usuarios.js             # /api/usuarios
  middleware/
    auth.js                 # middleware autenticar()
prisma/
  schema.prisma             # modelos do banco
  seed.js                   # dados iniciais
  migrations/               # histórico de migrações
```

## Padrões de código

- **Autenticação**: todas as rotas `/api/*` usam `router.use(autenticar)` no topo
- **Isolamento por usuário**: filtrar sempre por `usuarioId = req.usuarioId`
- **Erros Prisma**: P2025 = não encontrado (404), P2003 = FK violation (404)
- **Respostas de erro**: sempre `{ erro: "mensagem" }` — nunca expor stack trace
- **Sem comentários óbvios** — o código deve ser autoexplicativo

## Problemas conhecidos (ver specs/features/ para detalhes)

| Área | Problema | Prioridade |
|------|----------|------------|
| Auth | Token não é JWT real (sem expiração) | Alta |
| Auth | SHA-256 sem salt (trocar por bcrypt) | Alta |
| Tarefas | Sem verificação de ownership no GET/PUT/DELETE /:id | Alta |
| Metas | `concluida` não atualiza automaticamente quando progress = 100 | Média |
| Finanças | Sem endpoint de saldo | Média |
| Hábitos | Sem endpoint de registro de conclusão | Média |
| Geral | Sem paginação | Baixa |

## Dependências de desenvolvimento (locais)

| Pacote | Uso |
|--------|-----|
| `jest` | framework de testes |
| `supertest` | testes HTTP de integração |
| `eslint` + `@eslint/js` | linting |
| `nodemon` | hot-reload em dev |
| `prisma` | CLI do Prisma (migrate, studio) |
