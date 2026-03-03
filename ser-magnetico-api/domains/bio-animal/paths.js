export default {

  paresEmocionais: (n) =>
    `BIO-ANIMAL/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.txt`,

  reservatorios: (n) =>
    `BIO-ANIMAL/RESERVATORIOS/RESERVATORIO-${n}.txt`,

  rastreioGeral: (n) =>
    `BIO-ANIMAL/RASTREIO-GERAL/RASTREIO-GERAL-${n}.txt`,

  sistemas: (n) =>
    `BIO-ANIMAL/SISTEMAS/SISTEMA-${n}.txt`,

  paresSistema: ({ sistema, par }) =>
    `BIO-ANIMAL/PARES-SISTEMA/PAR-SISTEMA-${sistema}-${par}.txt`

};
