/**
 * ESPÍRITOS E MIASMAS — Paths determinísticos de conteúdo
 * Cada função retorna exatamente o caminho do arquivo no repositório GitHub
 * Nenhuma lógica interpretativa é aplicada aqui.
 */

const paths = {

  portais: (n) =>
    `ESPIRITOS/FECHAMENTO-PORTAIS/FECHAMENTO-PORTAL-${n}.txt`,

  pactos: (n) =>
    `ESPIRITOS/CANCELAMENTO-PACTOS/CANCELAMENTO-PACTO-${n}.txt`,

  espiritos: (n) =>
    `ESPIRITOS/LIBERACAO-ESPIRITOS/LIBERACAO-${n}.txt`,

  energias: (n) =>
    `ESPIRITOS/ENERGIAS-DENSAS/ENERGIA-${n}.txt`,

  associacoes: (n) =>
    `ESPIRITOS/ASSOCIACOES-EMOCIONAIS/ASSOCIACAO-${n}.txt`,

  miasmas: (n) =>
    `ESPIRITOS/MIASMAS/MIASMA-${n}.txt`,

  mantras: (n) =>
    `ESPIRITOS/MANTRAS/MANTRA-${n}.md`

};


/**
 * Normalização de categorias recebidas via JSON da Action
 */

export const categoryMap = Object.freeze({

  portais: "portais",
  fechamento_portais: "portais",

  pactos: "pactos",
  cancelamento_pactos: "pactos",

  espiritos: "espiritos",
  liberacao_espiritos: "espiritos",

  energias: "energias",
  energias_densas: "energias",

  associacoes: "associacoes",
  associacoes_emocionais: "associacoes",

  miasmas: "miasmas",

  mantras: "mantras"

});


/**
 * Resolve a função de path a partir da categoria
 */

export function resolvePath(category) {

  const normalized = categoryMap[category];

  return normalized ? paths[normalized] : null;

}


/**
 * Export principal congelado
 */

export default Object.freeze(paths);
