import { fetchFromGitHub } from "./githubService.js";

export async function aggregateData(dados, paths) {
  const resultado = {};
  const promises = [];

  for (const categoria in dados) {

    if (!paths[categoria]) {
      console.warn(`Categoria ignorada: ${categoria}`);
      continue;
    }

    if (!Array.isArray(dados[categoria])) continue;

    resultado[categoria] = {};

    for (const item of dados[categoria]) {
      const path = paths[categoria](item);

      const promise = fetchFromGitHub(path).then((conteudo) => {
        resultado[categoria][item] = conteudo;
      });

      promises.push(promise);
    }
  }

  await Promise.all(promises);

  return resultado;
}
