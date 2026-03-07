/**
 * DAM — Paths determinísticos de conteúdo
 * Cada função retorna exatamente o caminho do arquivo no repositório GitHub
 * Nenhuma lógica interpretativa é aplicada aqui.
 */

const paths = {

  cartas: (n) =>
    `DAM/CARTAS/CARTA-${n}.txt`,

  areasSistemicas: (n) =>
    `DAM/AREAS-SISTEMICAS/AREA-SISTEMICA-${n}.txt`,

  areasDeAtuacao: (n) =>
    `DAM/AREAS-DE-ATUACAO/AREA-DE-ATUACAO-${n}.txt`,

  desativacoes: (n) =>
    `DAM/DESATIVACOES/DESATIVACAO-${n}.txt`,

  ativacoes: (n) =>
    `DAM/ATIVACOES/ATIVACAO-${n}.txt`,

  mantraAtivacao:
    `DAM/MANTRAS/MANTRA-ATIVACAO.txt`,

  mantraDesativacao:
    `DAM/MANTRAS/MANTRA-DESATIVACAO.txt`

};


/**
 * Normalização de categorias recebidas via JSON da Action
 */

export const categoryMap = Object.freeze({

  cartas: "cartas",
  cartas_da_consciencia: "cartas",

  areas_sistemicas: "areasSistemicas",
  areasSistemicas: "areasSistemicas",

  areas_de_atuacao: "areasDeAtuacao",
  areasDeAtuacao: "areasDeAtuacao",

  desativacoes: "desativacoes",

  ativacoes: "ativacoes"

});


/**
 * Resolve a função de path a partir da categoria
 */

export function resolvePath(category) {

  const normalized = categoryMap[category];

  if (!normalized) return null;

  return paths[normalized];

}


/**
 * Resolve o path final para um número específico
 */

export function resolveDam(category, numero) {

  const resolver = resolvePath(category);

  if (!resolver) return null;

  return resolver(numero);

}


/**
 * Export principal congelado
 */

export default Object.freeze(paths);
