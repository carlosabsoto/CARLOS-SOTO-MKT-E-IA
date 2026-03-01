import { fetchFromGitHub } from "./githubService.js";

/**
 * Agregador determinístico de conteúdo
 * Recebe os dados do rastreio e resolve os paths do domínio
 */

export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};
  const promises = [];

  for (const categoria in dados) {

    // 🔹 resolve função de path (normalizada)
    const pathFunction = resolvePath
      ? resolvePath(categoria)
      : paths[categoria];

    if (!pathFunction) continue;

    if (!Array.isArray(dados[categoria])) continue;

    resultado[categoria] = {};

    for (const item of dados[categoria]) {

      let path;
      let key;

      // 🔹 objeto (ex: paresSistema)
      if (typeof item === "object" && item !== null) {

        path = pathFunction(item);
        key = `${item.sistema}-${item.par}`;

      } else {

        path = pathFunction(item);
        key = item;

      }

      resultado[categoria][key] = null;

      const promise = fetchFromGitHub(path)
        .then((conteudo) => {
          resultado[categoria][key] = conteudo;
        })
        .catch((error) => {
          resultado[categoria][key] = `ERRO: ${error.message}`;
        });

      promises.push(promise);
    }
  }

  await Promise.all(promises);

  return resultado;
}
