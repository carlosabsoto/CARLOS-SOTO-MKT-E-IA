/*
------------------------------------------------
UTIL — DIVIDIR TEXTO GRANDE
------------------------------------------------
*/

const LIMITE_BLOCO = 4000;

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
ADICIONAR ITEM COMO BLOCO
------------------------------------------------
*/

function adicionarItemComoBloco(blocos, titulo, texto) {

  const conteudo = titulo
    ? titulo + "\n\n" + texto
    : texto;

  const partes = dividirTextoSeguro(conteudo);

  partes.forEach(p => blocos.push(p));

}


/*
------------------------------------------------
AGGREGATOR DAM
------------------------------------------------
*/

export function aggregateDAM(resultado, mantraAtivacao, mantraDesativacao) {

  const blocos = [];


  /*
  ------------------------------------------------
  MANTRA DE ATIVAÇÃO
  ------------------------------------------------
  */

  if (mantraAtivacao) {

    adicionarItemComoBloco(
      blocos,
      "MANTRA DE ATIVAÇÃO",
      mantraAtivacao
    );

  }


  /*
  ------------------------------------------------
  CARTAS
  ------------------------------------------------
  */

  if (resultado.cartas) {

    const keys = Object.keys(resultado.cartas).sort((a,b)=>Number(a)-Number(b));

    for (const key of keys) {

      adicionarItemComoBloco(
        blocos,
        "Cartas da Consciência",
        resultado.cartas[key]
      );

    }

  }


  /*
  ------------------------------------------------
  ÁREAS SISTÊMICAS
  ------------------------------------------------
  */

  if (resultado.areasSistemicas) {

    const keys = Object.keys(resultado.areasSistemicas).sort((a,b)=>Number(a)-Number(b));

    for (const key of keys) {

      adicionarItemComoBloco(
        blocos,
        "Áreas Sistêmicas",
        resultado.areasSistemicas[key]
      );

    }

  }


  /*
  ------------------------------------------------
  ÁREAS DE ATUAÇÃO
  ------------------------------------------------
  */

  if (resultado.areasDeAtuacao) {

    const keys = Object.keys(resultado.areasDeAtuacao).sort((a,b)=>Number(a)-Number(b));

    for (const key of keys) {

      adicionarItemComoBloco(
        blocos,
        "Áreas de Atuação",
        resultado.areasDeAtuacao[key]
      );

    }

  }


  /*
  ------------------------------------------------
  DESATIVAÇÕES
  ------------------------------------------------
  */

  if (resultado.desativacoes) {

    const keys = Object.keys(resultado.desativacoes).sort((a,b)=>Number(a)-Number(b));

    for (const key of keys) {

      adicionarItemComoBloco(
        blocos,
        "Desativações",
        resultado.desativacoes[key]
      );

    }

  }


  /*
  ------------------------------------------------
  ATIVAÇÕES
  ------------------------------------------------
  */

  if (resultado.ativacoes) {

    const keys = Object.keys(resultado.ativacoes).sort((a,b)=>Number(a)-Number(b));

    for (const key of keys) {

      adicionarItemComoBloco(
        blocos,
        "Ativações",
        resultado.ativacoes[key]
      );

    }

  }


  /*
  ------------------------------------------------
  MANTRA DE DESATIVAÇÃO
  ------------------------------------------------
  */

  if (mantraDesativacao) {

    adicionarItemComoBloco(
      blocos,
      "MANTRA DE DESATIVAÇÃO",
      mantraDesativacao
    );

  }


  return blocos;

}
