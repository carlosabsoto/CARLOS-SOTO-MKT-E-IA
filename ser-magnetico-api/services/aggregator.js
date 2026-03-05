const cache = new Map();

async function fetchCached(path, fetchFn) {

  if (cache.has(path)) {
    return cache.get(path);
  }

  const data = await fetchFn(path);

  cache.set(path, data);

  return data;

}


export async function aggregateData(dados, paths, resolvePath) {

  const resultado = {};

  const downloads = [];

  for (const categoria in dados) {

    const valores = dados[categoria];

    if (!Array.isArray(valores)) continue;

    resultado[categoria] = {};

    for (const numero of valores) {

      const path = resolvePath(categoria, numero, paths);

      if (!path) continue;

      downloads.push(
        fetchCached(path, async (p) => {

          const conteudo = await fetchFromGitHub(p);

          return {
            categoria,
            numero,
            conteudo
          };

        })
      );

    }

  }

  const responses = await Promise.all(downloads);

  for (const item of responses) {

    if (!resultado[item.categoria]) {
      resultado[item.categoria] = {};
    }

    resultado[item.categoria][item.numero] = item.conteudo;

  }

  return resultado;

}
