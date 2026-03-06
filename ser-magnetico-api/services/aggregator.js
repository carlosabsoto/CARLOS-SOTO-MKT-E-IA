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
  const pathMap = new Map(); // path → lista de usos

  for (const categoria in dados) {

    const valores = dados[categoria];

    if (!Array.isArray(valores)) continue;

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

        if (!pathMap.has(path)) {
          pathMap.set(path, []);
        }

        pathMap.get(path).push({
          categoria,
          chave
        });

      } catch (error) {

        console.error("Erro ao resolver path:", categoria, numero, error);

      }

    }

  }

  // 🔹 baixa cada arquivo apenas uma vez
  const downloads = [];

  for (const [path, usos] of pathMap.entries()) {

    const task = fetchCached(path).then((conteudo) => ({
      path,
      usos,
      conteudo
    }));

    downloads.push(task);

  }

  const responses = await Promise.allSettled(downloads);

  for (const response of responses) {

    if (response.status !== "fulfilled") continue;

    const { usos, conteudo } = response.value;

    for (const uso of usos) {

      if (!resultado[uso.categoria]) {
        resultado[uso.categoria] = {};
      }

      resultado[uso.categoria][uso.chave] = conteudo;

    }

  }

  return resultado;

}
