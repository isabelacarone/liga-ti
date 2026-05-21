# Liga Feminina de TI — UVV

Repositório do projeto desenvolvido para o desafio proposto pela Liga Feminina de TI da UVV.

## Propósito

Construir uma plataforma digital de organização pessoal — **MenteLeve** — que ajuda pessoas com TDAH a gerenciar tarefas, hábitos, metas e finanças de forma simples e acessível.

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
