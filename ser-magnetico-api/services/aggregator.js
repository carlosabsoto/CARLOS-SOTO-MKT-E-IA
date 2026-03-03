import { fetchFromGitHub } from "./githubService.js";

/**
 * Cache global do conteúdo carregado
 */

const repositoryCache = new Map();

/**
 * Carrega arquivo com cache
 */

async function loadFile(path) {

  if (repositoryCache.has(path)) {
    return repositoryCache.get(path);
  }

  try {

    const content = await fetchFromGitHub(path);

    repositoryCache.set(path, content);

    return content;

  } catch (err) {

    console.warn("Arquivo não encontrado:", path);

    return null;

  }

}


/**
 * Agregador TURBO
 */

export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};

  const categorias = Object.keys(dados);

  for (const categoria of categorias) {

    const handler = resolvePath(categoria);

    if (!handler) {
      console.warn("Categoria ignorada:", categoria);
      continue;
    }

    const valores = dados[categoria];

    resultado[categoria] = {};

    const tasks = valores.map(async (valor) => {

      try {

        const path = handler(valor);

        if (!path) return;

        const content = await loadFile(path);

        if (!content) return;

        const key =
          typeof valor === "object"
            ? `${valor.sistema}-${valor.par}`
            : String(valor);

        resultado[categoria][key] = content;

      } catch (err) {

        console.error("Erro processando:", categoria, valor);

      }

    });

    await Promise.all(tasks);

  }

  return resultado;

}
