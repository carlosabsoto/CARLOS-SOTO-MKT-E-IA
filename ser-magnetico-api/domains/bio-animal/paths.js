export default {

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
