const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS da raiz)
app.use(express.static(path.join(__dirname, "..")));

// Rotas de autenticação
app.use("/auth", require("./routes/auth"));

// Rotas da API
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/tarefas", require("./routes/tarefas"));
app.use("/api/habitos", require("./routes/habitos"));
app.use("/api/metas", require("./routes/metas"));
app.use("/api/financas", require("./routes/financas"));

// Rota raiz - serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: "Erro interno do servidor", detalhe: err.message });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 MenteLeve API rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
