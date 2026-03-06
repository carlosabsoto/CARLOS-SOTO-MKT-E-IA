import { fetchFromGitHub } from "./githubService.js";

const cache = new Map();

async function fetchCached(path) {

  if (!path || typeof path !== "string") {
    console.warn("Caminho inválido recebido:", path);
    return "";
  }

  if (cache.has(path)) {
    return cache.get(path);
  }

  const data = await fetchFromGitHub(path);

  cache.set(path, data);

  return data;
}

function gerarChave(numero) {

  if (typeof numero === "object" && numero !== null) {

    if ("sistema" in numero && "par" in numero) {
      return `${numero.sistema}-${numero.par}`;
    }

    return JSON.stringify(numero);
  }

  return numero;
}


export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};
  const tasks = [];
  const pathCache = new Map(); // deduplicação

  for (const categoria in dados) {

    const valores = dados[categoria];

    if (!Array.isArray(valores)) continue;

    resultado[categoria] = {};

    for (const numero of valores) {

      try {

        let path;

        if (typeof numero === "object" && numero !== null) {

          if ("sistema" in numero && "par" in numero) {
            path = resolvePath(categoria, numero.par, paths, numero.sistema);
          } else {
            path = resolvePath(categoria, numero, paths);
          }

        } else {

          path = resolvePath(categoria, numero, paths);

        }

        if (typeof path === "function") {
          path = path(numero);
        }

        if (!path || typeof path !== "string") {
          console.warn("Path inválido:", categoria, numero, path);
          continue;
        }

        const chave = gerarChave(numero);

        if (!pathCache.has(path)) {

          const task = fetchCached(path).then((conteudo) => ({
            path,
            conteudo
          }));

          pathCache.set(path, task);

        }

        tasks.push(
          pathCache.get(path).then(({ conteudo }) => ({
            categoria,
            chave,
            conteudo
          }))
        );

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

    resultado[item.categoria][item.chave] = item.conteudo;

  }

  return resultado;

}
