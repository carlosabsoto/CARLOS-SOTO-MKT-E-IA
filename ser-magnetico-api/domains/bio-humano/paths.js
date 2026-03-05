export function resolvePath(categoria, numero, paths, sistema = null) {

  if (!categoria || !paths[categoria]) {
    console.warn("Categoria inválida:", categoria);
    return null;
  }

  // tratamento especial para pares de sistema
  if (categoria === "paresSistema") {

    if (!sistema || !numero) {
      console.warn("Par de sistema incompleto:", sistema, numero);
      return null;
    }

    const sistemaMap = paths[categoria]?.[sistema];

    if (!sistemaMap) {
      console.warn("Sistema inexistente:", sistema);
      return null;
    }

    const path = sistemaMap[numero];

    if (!path) {
      console.warn("Par inexistente:", sistema, numero);
      return null;
    }

    return path;
  }

  // categorias normais
  const categoriaMap = paths[categoria];

  if (!categoriaMap) {
    console.warn("Categoria não encontrada:", categoria);
    return null;
  }

  const path = categoriaMap[numero];

  if (!path) {
    console.warn("Número inexistente:", categoria, numero);
    return null;
  }

  return path;
}
