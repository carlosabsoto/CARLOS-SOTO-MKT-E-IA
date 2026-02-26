export default {
  paresEmocionais: (n) =>
    `BIO-HUMANO/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.txt`,

  reservatorios: (n) =>
    `BIO-HUMANO/RESERVATORIOS/RESERVATORIO-${n}.txt`,

  rastreioGeral: (n) =>
    `BIO-HUMANO/RASTREIO-GERAL/RASTREIO-GERAL-${n}.txt`,

  sistemas: (n) =>
    `BIO-HUMANO/SISTEMAS/SISTEMA-${n}.txt`,

  paresSistema: ({ sistema, par }) =>
    `BIO-HUMANO/SISTEMAS/PARES/PAR-SISTEMA-${sistema}-${par}.txt`
};
