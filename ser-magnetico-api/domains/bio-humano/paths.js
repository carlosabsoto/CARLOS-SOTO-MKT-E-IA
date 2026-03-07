export default {

  paresEmocionais: (numero) =>
    `bio-humano/pares-emocionais/${numero}.md`,

  reservatorios: (numero) =>
    `bio-humano/reservatorios/${numero}.md`,

  rastreioGeral: (numero) =>
    `bio-humano/rastreio-geral/${numero}.md`,

  sistemas: (numero) =>
    `bio-humano/sistemas/${numero}/sistema.md`,

  paresSistema: (sistema, par) =>
    `bio-humano/sistemas/${sistema}/pares/${par}.md`

}
