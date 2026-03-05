import { fetchFromGitHub } from "./githubService.js";

const cache = new Map();

async function fetchCached(path) {

  try {

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

  } catch (error) {

    console.error("Erro ao baixar do GitHub:", path, error);

    return "";

  }

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

  for (const categoria in dados) {

    const valores = dados[categoria];

    if (!Array.isArray(valores)) continue;

    resultado[categoria] = {};

    for (const numero of valores) {

      try {

        let path;

        // 🔹 suporte para objetos (paresSistema)
        if (typeof numero === "object" && numero !== null) {

          if ("sistema" in numero && "par" in numero) {
            path = resolvePath(categoria, numero.par, paths, numero.sistema);
          } else {
            path = resolvePath(categoria, numero, paths);
          }

        } else {

          path = resolvePath(categoria, numero, paths);

        }

        // 🔹 se resolvePath retornar função
        if (typeof path === "function") {
          path = path(numero);
        }

        console.log("PATH RESOLVIDO:", categoria, numero, path);

        if (!path || typeof path !== "string") {
          console.warn("Path inválido:", categoria, numero, path);
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

    const chave = gerarChave(item.numero);

    resultado[item.categoria][chave] = item.conteudo;

  }

  return resultado;

}
