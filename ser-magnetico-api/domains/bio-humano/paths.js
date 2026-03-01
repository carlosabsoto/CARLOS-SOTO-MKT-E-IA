/**
 * BIO HUMANO — Paths determinísticos de conteúdo
 * Cada função retorna exatamente o caminho do arquivo no repositório GitHub
 * Nenhuma lógica interpretativa é aplicada aqui.
 */

const paths = {

  paresEmocionais: (n) =>
    `BIO-HUMANO/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.txt`,

  reservatorios: (n) =>
    `BIO-HUMANO/RESERVATORIOS/RESERVATORIO-${n}.txt`,

  rastreioGeral: (n) =>
    `BIO-HUMANO/RASTREIO-GERAL/RASTREIO-GERAL-${n}.txt`,

  sistemas: (n) =>
    `BIO-HUMANO/SISTEMAS/SISTEMA-${n}.txt`,

  paresSistema: ({ sistema, par }) =>
    `BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-${sistema}-${par}.txt`,

  protocolos: (n) =>
    `BIO-HUMANO/PROTOCOLOS/PROTOCOLO-${n}.md`
};


/**
 * Normalização opcional de categorias
 * Permite aceitar diferentes formatos vindos do JSON da Action
 */

export const categoryMap = Object.freeze({
  pares_emocionais: "paresEmocionais",
  paresEmocionais: "paresEmocionais",

  reservatorios: "reservatorios",

  rastreio_geral: "rastreioGeral",
  rastreioGeral: "rastreioGeral",

  sistemas: "sistemas",

  pares_sistema: "paresSistema",
  paresSistema: "paresSistema",

  protocolos: "protocolos"
});


/**
 * Resolve a função de path a partir da categoria recebida
 */

export function resolvePath(category) {
  const normalized = categoryMap[category];
  return normalized ? paths[normalized] : null;
}


/**
 * Export principal congelado (imutável)
 */

export default Object.freeze(paths);
