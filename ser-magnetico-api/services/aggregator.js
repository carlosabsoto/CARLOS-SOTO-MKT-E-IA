import { fetchFromGitHub } from "./githubService.js";

const cache = new Map();

async function fetchCached(path) {

  if (cache.has(path)) {
    return cache.get(path);
  }

  const data = await fetchFromGitHub(path);

  cache.set(path, data);

  return data;

}

export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};

  const tasks = [];

  for (const categoria in dados) {

    const valores = dados[categoria];

    if (!Array.isArray(valores)) continue;

    resultado[categoria] = {};

    for (const numero of valores) {

      const path = resolvePath(categoria, numero, paths);

      if (!path) continue;

      tasks.push(
        fetchCached(path).then((conteudo) => ({
          categoria,
          numero,
          conteudo
        }))
      );

    }

  }

  const responses = await Promise.all(tasks);

  for (const item of responses) {

    if (!resultado[item.categoria]) {
      resultado[item.categoria] = {};
    }

    resultado[item.categoria][item.numero] = item.conteudo;

  }

  return resultado;

}
