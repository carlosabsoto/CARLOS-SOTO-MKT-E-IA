const BASE = "BIO-HUMANO";

export default {

  paresEmocionais: (numero) =>
    `${BASE}/PARES-EMOCIONAIS/PAR-EMOCIONAL-${numero}.txt`,

  reservatorios: (numero) =>
    `${BASE}/RESERVATORIOS/RESERVATORIO-${numero}.txt`,

  rastreioGeral: (numero) =>
    `${BASE}/RASTREIO-GERAL/RASTREIO-GERAL-${numero}.txt`,

  sistemas: (numero) =>
    `${BASE}/SISTEMAS/SISTEMA-${numero}.txt`,

  paresSistema: (sistema, par) =>
    `${BASE}/SISTEMAS/PARES/PAR-SISTEMA-${sistema}-${par}.txt`,

  protocolos: (numero) =>
    `${BASE}/PROTOCOLOS/PROTOCOLO-${numero}.md`

};
