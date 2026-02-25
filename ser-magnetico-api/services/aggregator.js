import { fetchFromGitHub } from "./githubService.js";

export async function aggregateData(dados, paths) {
  const resultado = {};

  const promises = [];

  for (const categoria in dados) {
    resultado[categoria] = {};

    for (const numero of dados[categoria]) {
      const path = paths[categoria](numero);

      const promise = fetchFromGitHub(path).then((conteudo) => {
        resultado[categoria][numero] = conteudo;
      });

      promises.push(promise);
    }
  }

  await Promise.all(promises);

  return resultado;
}
