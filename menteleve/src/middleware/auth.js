// Middleware para validar token JWT
function autenticar(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const token = auth.substring(7); // Remove "Bearer "
  const [tokenHash, usuarioId] = token.split("_");

  if (!tokenHash || !usuarioId) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  // Adiciona usuarioId ao request para uso posterior
  req.usuarioId = usuarioId;
  next();
}

module.exports = { autenticar };
