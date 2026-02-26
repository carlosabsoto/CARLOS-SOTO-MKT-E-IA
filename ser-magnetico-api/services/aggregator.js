import { fetchFromGitHub } from "./githubService.js";

export async function aggregateData(dados, paths) {
  const resultado = {};
  const promises = [];

  for (const categoria in dados) {

    // ignora categoria que não existe no domínio
    if (!paths[categoria]) continue;

    if (!Array.isArray(dados[categoria])) continue;

    resultado[categoria] = {};

    for (const item of dados[categoria]) {

      let path;

      // 🔹 Se for objeto (ex: paresSistema)
      if (typeof item === "object" && item !== null) {
        path = paths[categoria](item);
        resultado[categoria][`${item.sistema}-${item.par}`] = null;
      } 
      // 🔹 Se for número simples
      else {
        path = paths[categoria](item);
        resultado[categoria][item] = null;
      }

      const promise = fetchFromGitHub(path).then((conteudo) => {
        if (typeof item === "object" && item !== null) {
          resultado[categoria][`${item.sistema}-${item.par}`] = conteudo;
        } else {
          resultado[categoria][item] = conteudo;
        }
      });

      promises.push(promise);
    }
  }

  await Promise.all(promises);

  return resultado;
}
