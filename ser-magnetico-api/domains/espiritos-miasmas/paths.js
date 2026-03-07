const paths = {

  fechamentoPortais: (n) =>
    `ESPIRITOS/FECHAMENTO-PORTAIS/FECHAMENTO-PORTAL-${n}.txt`,

  cancelamentoPactos: (n) =>
    `ESPIRITOS/CANCELAMENTO-PACTOS/CANCELAMENTO-PACTO-${n}.txt`,

  liberacaoEspiritos: (n) =>
    `ESPIRITOS/LIBERACAO-ESPIRITOS/LIBERACAO-${n}.txt`,

  energiasDensas: (n) =>
    `ESPIRITOS/ENERGIAS-DENSAS/ENERGIA-${n}.txt`,

  associacaoEmocional: (n) =>
    `ESPIRITOS/ASSOCIACOES-EMOCIONAIS/ASSOCIACAO-${n}.txt`,

  miasmas: (n) =>
    `ESPIRITOS/MIASMAS/MIASMA-${n}.txt`,

  mantras: (n) =>
    `ESPIRITOS/MANTRAS/MANTRA-${n}.md`

};

export default Object.freeze(paths);
