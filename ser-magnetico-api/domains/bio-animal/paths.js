import config from "./config.js";

const base = "BIO-ANIMAL";

const paths = {

  paresEmocionais: (n) =>
    `${base}/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.md`,

  reservatorios: (n) =>
    `${base}/RESERVATORIOS/RESERVATORIO-${n}.md`,

  rastreioGeral: (n) =>
    `${base}/RASTREIO-GERAL/RASTREIO-GERAL-${n}.md`,

  sistemas: (n) =>
    `${base}/SISTEMAS/SISTEMA-${n}.md`,

  paresSistema: ({ sistema, par }) =>
    `${base}/SISTEMAS/PARES/PAR-SISTEMA-${sistema}-${par}.md`

};

export function resolvePath(tipo, valor) {

  const handler = paths[tipo];

  if (!handler) {
    console.warn("Tipo não encontrado:", tipo);
    return null;
  }

  try {
    return handler(valor);
  } catch (err) {
    console.error("Erro ao resolver path:", tipo, valor);
    return null;
  }

}

export default paths;
