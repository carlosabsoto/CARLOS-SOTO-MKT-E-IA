import { fetchFromGitHub } from "./githubService.js";
import { runConcurrent } from "./concurrentQueue.js";

export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};
  const tasks = [];

  for (const categoria in dados) {

    const pathFunction = resolvePath
      ? resolvePath(categoria)
      : paths[categoria];

    if (!pathFunction) continue;
    if (!Array.isArray(dados[categoria])) continue;

    resultado[categoria] = {};

    for (const item of dados[categoria]) {

      let path;
      let key;

      if (typeof item === "object" && item !== null) {

        path = pathFunction(item);
        key = `${item.sistema}-${item.par}`;

      } else {

        path = pathFunction(item);
        key = item;

      }

      resultado[categoria][key] = null;

      tasks.push(async () => {

        try {

          const conteudo = await fetchFromGitHub(path);
          resultado[categoria][key] = conteudo;

        } catch (error) {

          resultado[categoria][key] =
            `ERRO: ${error.message}`;

        }

      });

    }
  }

  // 🔹 executa downloads com limite de concorrência
  await runConcurrent(tasks, 5);

  return resultado;
}
