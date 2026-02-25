export function validateRequest(body) {
  if (!body.curso) {
    throw new Error("Curso não informado");
  }

  if (!body.dados) {
    throw new Error("Dados não informados");
  }

  return true;
}
