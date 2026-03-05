// 🔹 tabela de caminhos dos arquivos do BIO HUMANO

const bioHumanoPaths = {

  paresEmocionais: {
    1: "BIO-HUMANO/PARES-EMOCIONAIS/PAR-EMOCIONAL-1.txt",
    2: "BIO-HUMANO/PARES-EMOCIONAIS/PAR-EMOCIONAL-2.txt"
    // continuar...
  },

  reservatorios: {
    1: "BIO-HUMANO/RESERVATORIOS/RESERVATORIO-1.txt",
    2: "BIO-HUMANO/RESERVATORIOS/RESERVATORIO-2.txt"
    // continuar...
  },

  rastreioGeral: {
    1: "BIO-HUMANO/RASTREIO-GERAL/RASTREIO-GERAL-1.txt",
    2: "BIO-HUMANO/RASTREIO-GERAL/RASTREIO-GERAL-2.txt"
    // continuar...
  },

  sistemas: {
    1: "BIO-HUMANO/SISTEMAS/SISTEMA-1.txt",
    2: "BIO-HUMANO/SISTEMAS/SISTEMA-2.txt"
    // continuar...
  },

  // 🔹 pares de sistema organizados por sistema
  paresSistema: {

    1: {
      1: "BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-1-1.txt",
      2: "BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-1-2.txt"
    },

    2: {
      1: "BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-2-1.txt",
      2: "BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-2-2.txt"
    },

    3: {
      1: "BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-3-1.txt",
      2: "BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-3-2.txt"
    }

    // continuar para todos os sistemas
  },

  protocolos: {
    1: "BIO-HUMANO/PROTOCOLOS/PROTOCOLO-1.md",
    2: "BIO-HUMANO/PROTOCOLOS/PROTOCOLO-2.md"
    // continuar...
  }

};

export default bioHumanoPaths;


// 🔹 resolver seguro de caminhos

export function resolvePath(categoria, numero, paths, sistema = null) {

  if (!categoria || !paths[categoria]) {
    console.warn("Categoria inválida:", categoria);
    return null;
  }

  // 🔹 tratamento especial para pares de sistema
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

  // 🔹 categorias normais

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
