/**
 * BIO ANIMAL — Paths determinísticos de conteúdo
 * Cada função retorna exatamente o caminho do arquivo no repositório GitHub
 */

const paths = {

  paresEmocionais: (n) =>
    `BIO-ANIMAL/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.md`,

  reservatorios: (n) =>
    `BIO-ANIMAL/RESERVATORIOS/RESERVATORIO-${n}.md`,

  rastreioGeral: (n) =>
    `BIO-ANIMAL/RASTREIO-GERAL/RASTREIO-GERAL-${n}.md`,

  sistemas: (n) =>
    `BIO-ANIMAL/SISTEMAS/SISTEMA-${n}.md`,

  paresSistema: ({ sistema, par }) =>
    `BIO-ANIMAL/SISTEMAS/PARES/PAR-SISTEMA-${sistema}-${par}.md`

};


/**
 * Normalização opcional de categorias
 */

export const categoryMap = Object.freeze({

  pares_emocionais: "paresEmocionais",
  paresEmocionais: "paresEmocionais",

  reservatorios: "reservatorios",

  rastreio_geral: "rastreioGeral",
  rastreioGeral: "rastreioGeral",

  sistemas: "sistemas",

  pares_sistema: "paresSistema",
  paresSistema: "paresSistema"

});


/**
 * Resolve a função de path a partir da categoria
 */

export function resolvePath(category) {

  const normalized = categoryMap[category];

  return normalized ? paths[normalized] : null;

}


/**
 * Export congelado
 */

export default Object.freeze(paths);
