/*
------------------------------------------------
UTIL — DIVIDIR TEXTO EM BLOCOS SEGUROS
------------------------------------------------
*/

const LIMITE_BLOCO = 5000;

function dividirTextoSeguro(texto = "") {

  if (!texto) return [];

  const partes = [];

  let inicio = 0;

  while (inicio < texto.length) {

    partes.push(texto.slice(inicio, inicio + LIMITE_BLOCO));

    inicio += LIMITE_BLOCO;

  }

  return partes;

}


/*
------------------------------------------------
AGGREGATOR DAM
------------------------------------------------
*/

export function aggregateDAM(resultado, mantraAtivacao, mantraDesativacao) {

  const blocos = [];

  function adicionarBlocos(texto) {

    const partes = dividirTextoSeguro(texto);

    partes.forEach(p => blocos.push(p));

  }


  /*
  ------------------------------------------------
  MANTRA DE ATIVAÇÃO
  ------------------------------------------------
  */

  if (mantraAtivacao) {

    adicionarBlocos(
      "MANTRA DE ATIVAÇÃO\n\n" + mantraAtivacao + "\n\n"
    );

  }


  /*
  ------------------------------------------------
  FUNÇÃO DE CATEGORIA
  ------------------------------------------------
  */

  function adicionarCategoria(titulo, categoria) {

    const itens = resultado[categoria];

    if (!itens || Object.keys(itens).length === 0) return;

    let textoCategoria = titulo + "\n\n";

    const keysOrdenadas = Object.keys(itens).sort((a,b)=>Number(a)-Number(b));

    for (const key of keysOrdenadas) {

      textoCategoria += itens[key] + "\n\n";

    }

    adicionarBlocos(textoCategoria);

  }


  /*
  ------------------------------------------------
  ORDEM DO DAM
  ------------------------------------------------
  */

  adicionarCategoria("Cartas da Consciência", "cartas");

  adicionarCategoria("Áreas Sistêmicas", "areasSistemicas");

  adicionarCategoria("Áreas de Atuação", "areasDeAtuacao");

  adicionarCategoria("Desativações", "desativacoes");

  adicionarCategoria("Ativações", "ativacoes");


  /*
  ------------------------------------------------
  MANTRA DE DESATIVAÇÃO
  ------------------------------------------------
  */

  if (mantraDesativacao) {

    adicionarBlocos(
      "MANTRA DE DESATIVAÇÃO\n\n" + mantraDesativacao
    );

  }


  return blocos;

}
