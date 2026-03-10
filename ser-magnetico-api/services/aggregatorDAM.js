function dividirBlocos(texto, tamanhoMax = 5000) {

  if (!texto) return [];

  const partes = [];

  let inicio = 0;

  while (inicio < texto.length) {

    partes.push(texto.slice(inicio, inicio + tamanhoMax));

    inicio += tamanhoMax;

  }

  return partes;

}

const LIMITE_BLOCO = 12000;

function dividirTextoSeguro(texto = "") {

  const partes = [];

  for (let i = 0; i < texto.length; i += LIMITE_BLOCO) {
    partes.push(texto.slice(i, i + LIMITE_BLOCO));
  }

  return partes;

}

export function aggregateDAM(resultado, mantraAtivacao, mantraDesativacao) {

  let textoFinal = "";

  if (mantraAtivacao) {
    textoFinal += "MANTRA DE ATIVAÇÃO\n\n" + mantraAtivacao + "\n\n";
  }

  function adicionarCategoria(titulo, categoria) {

    const itens = resultado[categoria];

    if (!itens || Object.keys(itens).length === 0) return;

    textoFinal += titulo + "\n\n";

    for (const key of Object.keys(itens)) {
      textoFinal += itens[key] + "\n\n";
    }

  }

  adicionarCategoria("Cartas da Consciência", "cartas");
  adicionarCategoria("Áreas Sistêmicas", "areasSistemicas");
  adicionarCategoria("Áreas de Atuação", "areasDeAtuacao");
  adicionarCategoria("Desativações", "desativacoes");
  adicionarCategoria("Ativações", "ativacoes");

  if (mantraDesativacao) {
    textoFinal += "MANTRA DE DESATIVAÇÃO\n\n" + mantraDesativacao;
  }

  return dividirTextoSeguro(textoFinal);

}
