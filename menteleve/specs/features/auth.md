# Spec: Autenticação

## Domínio
Cadastro e login de usuários. Geração de token para acesso autenticado.

## Endpoints

### POST /auth/registrar
Cria um novo usuário.

**Body obrigatório:** `nome`, `email`, `senha`

**Respostas:**
- `201` — usuário criado; retorna `{ message, token, usuario: { id, nome, email } }`
- `400` — campos faltando: `{ erro: "Nome, email e senha são obrigatórios" }`
- `400` — email já cadastrado: `{ erro: "Email já cadastrado" }`

### POST /auth/login
Autentica um usuário existente.

**Body obrigatório:** `email`, `senha`

**Respostas:**
- `200` — login bem-sucedido; retorna `{ token, usuario: { id, nome, email, premium } }`
- `400` — campos faltando: `{ erro: "Email e senha são obrigatórios" }`
- `401` — credenciais inválidas: `{ erro: "Email ou senha incorretos" }`

## Regras de negócio
- Senha armazenada como SHA-256 (sem salt — issue conhecida, trocar por bcrypt futuramente)
- Token gerado como `<32 bytes hex>_<usuarioId>` (sem expiração — issue conhecida, migrar para JWT real)
- O middleware `autenticar` extrai `usuarioId` do token e injeta em `req.usuarioId`
- Rotas `/api/*` exigem header `Authorization: Bearer <token>`
