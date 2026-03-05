import { fetchFromGitHub } from "./githubService.js";

const cache = new Map();

async function fetchCached(path) {

  try {

    if (cache.has(path)) {
      return cache.get(path);
    }

    const data = await fetchFromGitHub(path);

    cache.set(path, data);

    return data;

  } catch (error) {

    console.error("Erro ao baixar do GitHub:", path, error);

    return "";

  }

}

export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};

  const tasks = [];

  for (const categoria in dados) {

    const valores = dados[categoria];

    if (!Array.isArray(valores)) continue;

    resultado[categoria] = {};

    for (const numero of valores) {

      try {

        const path = resolvePath(categoria, numero, paths);
        
        console.log("PATH RESOLVIDO:", categoria, numero, path);

        if (!path) {
          console.warn("Path não encontrado:", categoria, numero);
          continue;
        }
        
        console.log("Baixando arquivo:", path);
        
        const task = fetchCached(path).then((conteudo) => ({
          categoria,
          numero,
          conteudo
        }));

        tasks.push(task);

      } catch (error) {

        console.error("Erro ao resolver path:", categoria, numero, error);

      }

    }

  }

  const responses = await Promise.allSettled(tasks);

  for (const response of responses) {

    if (response.status !== "fulfilled") continue;

    const item = response.value;

    if (!resultado[item.categoria]) {
      resultado[item.categoria] = {};
    }

    resultado[item.categoria][item.numero] = item.conteudo;

  }

  return resultado;

}
