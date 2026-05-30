# Liga Feminina de TI — UVV

Repositório do projeto desenvolvido para o desafio proposto pela Liga Feminina de TI da UVV.

## Propósito

Construir uma plataforma digital de organização pessoal **MenteLeve**, que ajuda pessoas com TDAH a gerenciar tarefas, hábitos, metas e finanças de forma simples e acessível.

## Estrutura

```
liga-ti/
├── menteleve/          # API REST (Node.js + Express + Prisma + SQLite)
├── slide/              # Apresentações do projeto
├── planejamento/       # Cronograma e planejamento
└── README.md
```

## Subprojeto principal

### menteleve/

API REST com autenticação, isolamento de dados por usuário e os seguintes módulos:

| Módulo    | Endpoints base       |
|-----------|----------------------|
| Auth      | `/auth`              |
| Tarefas   | `/api/tarefas`       |
| Hábitos   | `/api/habitos`       |
| Metas     | `/api/metas`         |
| Finanças  | `/api/financas`      |
| Usuários  | `/api/usuarios`      |

Veja `menteleve/README.md` para instruções de instalação e uso.

## Ambiente

- Node.js 18+ (gerenciado via nvm)
- SQLite via Prisma ORM

## Como executar (passo a passo)

Siga estes passos para rodar `menteleve` localmente.

1. Pré-requisitos

	- Instale o [Node.js 18+]. Recomenda-se usar `nvm` para gerenciar versões.
	- Verifique se tem `npm` e `npx` disponíveis.

2. Entrar no subprojeto e instalar dependências

	```bash
	cd menteleve
	npm install
	```

3. Configurar variáveis de ambiente

	- Crie um arquivo `.env` na raiz de `menteleve/` se necessário.
	- Exemplo mínimo para desenvolvimento (SQLite):

	```env
	DATABASE_URL="file:./prisma/dev.db"
	PORT=3000
	```

4. Gerar cliente Prisma e aplicar migrações

	```bash
	npx prisma generate
	npx prisma migrate dev --name init
	```

5. (Opcional) Popular banco com dados de exemplo

	```bash
	npm run db:seed
	# ou
	node prisma/seed.js
	```

6. Rodar em modo de desenvolvimento

	```bash
	npm run dev
	```

7. Rodar testes

	```bash
	npm test
	# para cobertura
	npm run test:coverage
	```

8. Outros scripts úteis

	- `npm run db:studio`: abre o Prisma Studio (localhost:5555)
	- `npm run db:reset`: recria o banco do zero (use com cuidado)
	- `npm start`: inicia em modo produção


