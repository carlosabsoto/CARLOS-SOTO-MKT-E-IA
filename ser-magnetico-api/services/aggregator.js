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

export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};
  const tasks = [];
  const pathCache = new Map();

  for (const categoria in dados) {

    const valores = dados[categoria];

    if (!Array.isArray(valores)) continue;

    if (!resultado[categoria] && categoria !== "paresSistema") {
      resultado[categoria] = {};
    }

    for (const numero of valores) {

      try {

        let path;
        let sistema = null;
        let par = null;

        // 🔹 tratamento especial para pares de sistema
        if (typeof numero === "object" && numero !== null) {

          if ("sistema" in numero && "par" in numero) {

            sistema = numero.sistema;
            par = numero.par;

            path = resolvePath(categoria, par, paths, sistema);

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

        if (!pathCache.has(path)) {

          const task = fetchCached(path).then((conteudo) => ({
            categoria,
            numero,
            sistema,
            par,
            conteudo
          }));

          pathCache.set(path, task);

        }

        tasks.push(pathCache.get(path));

      } catch (error) {

        console.error("Erro ao resolver path:", categoria, numero, error);

      }

    }

  }

  const responses = await Promise.allSettled(tasks);

  for (const response of responses) {

    if (response.status !== "fulfilled") continue;

    const item = response.value;

    const { categoria, numero, sistema, par, conteudo } = item;

    // 🔹 pares de sistema entram dentro de sistemas
    if (categoria === "paresSistema") {

      if (!resultado.sistemas) {
        resultado.sistemas = {};
      }

      if (!resultado.sistemas[sistema]) {
        resultado.sistemas[sistema] = {
          descricao: "",
          pares: {}
        };
      }

      resultado.sistemas[sistema].pares[par] = conteudo;

      continue;

    }

    // 🔹 sistemas
    if (categoria === "sistemas") {

      if (!resultado.sistemas) {
        resultado.sistemas = {};
      }

      if (!resultado.sistemas[numero]) {
        resultado.sistemas[numero] = {
          descricao: "",
          pares: {}
        };
      }

      resultado.sistemas[numero].descricao = conteudo;

      continue;

    }

    // 🔹 categorias normais
    if (!resultado[categoria]) {
      resultado[categoria] = {};
    }

    resultado[categoria][numero] = conteudo;

  }

  return resultado;

}
