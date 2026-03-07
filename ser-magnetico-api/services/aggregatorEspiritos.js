export function dividirEmBlocos(texto = "", tamanho = 12000) {

  const partes = [];
  let inicio = 0;

  while (inicio < texto.length) {

    partes.push(texto.slice(inicio, inicio + tamanho));
    inicio += tamanho;

  }

  return partes;

}


function adicionarLista(titulo, dados = {}) {

  let bloco = "";

  const lista = Object.values(dados);

  if (!lista.length) return "";

  bloco += titulo + "\n\n";

  lista.forEach(item => {

    if (item && item.trim()) {
      bloco += item.trim() + "\n";
    }

  });

  bloco += "\n";

  return bloco;

}



export function aggregateEspiritos(resultado = {}) {

  let conteudo = "";

  /*
  ------------------------------------------------
  MANTRA DE ABERTURA
  ------------------------------------------------
  */

  if (resultado.mantras?.[1]) {

    conteudo += "Mantra de abertura\n\n";
    conteudo += resultado.mantras[1].trim() + "\n\n";

  }


  /*
  ------------------------------------------------
  PORTAIS
  ------------------------------------------------
  */

  if (resultado.fechamentoPortais) {

    conteudo += "";

    if (resultado.mantras?.[2]) {
      conteudo += resultado.mantras[2].trim() + "\n\n";
    }

    conteudo += adicionarLista(
      "",
      resultado.fechamentoPortais
    );

  }



  /*
  ------------------------------------------------
  PACTOS
  ------------------------------------------------
  */

  if (resultado.cancelamentoPactos) {

    conteudo += "";

    if (resultado.mantras?.[3]) {
      conteudo += resultado.mantras[3].trim() + "\n\n";
    }

    conteudo += adicionarLista(
      "",
      resultado.cancelamentoPactos
    );

  }



  /*
  ------------------------------------------------
  ESPÍRITOS
  ------------------------------------------------
  */

  if (resultado.liberacaoEspiritos) {

    conteudo += "";

    if (resultado.mantras?.[4]) {
      conteudo += resultado.mantras[4].trim() + "\n\n";
    }

    conteudo += adicionarLista(
      "",
      resultado.liberacaoEspiritos
    );

  }



  /*
  ------------------------------------------------
  ENERGIAS DENSAS
  ------------------------------------------------
  */

  if (resultado.energiasDensas) {

    conteudo += "";

    if (resultado.mantras?.[5]) {
      conteudo += resultado.mantras[5].trim() + "\n\n";
    }

    conteudo += adicionarLista(
      "",
      resultado.energiasDensas
    );

  }



  /*
  ------------------------------------------------
  ASSOCIAÇÕES EMOCIONAIS
  ------------------------------------------------
  */

  if (resultado.associacaoEmocional) {

    conteudo += "";

    if (resultado.mantras?.[9]) {
      conteudo += resultado.mantras[9].trim() + "\n\n";
    }

    conteudo += adicionarLista(
      "",
      resultado.associacaoEmocional
    );

  }



  /*
  ------------------------------------------------
  PSIQUISMO
  ------------------------------------------------
  */

  if (resultado.mantras?.[10]) {

    conteudo += "";
    conteudo += resultado.mantras[10].trim() + "\n\n";

  }

  if (resultado.mantras?.[11]) {

    conteudo += "";
    conteudo += resultado.mantras[11].trim() + "\n\n";

  }



  /*
  ------------------------------------------------
  MIASMAS
  ------------------------------------------------
  */

  if (resultado.miasmas) {

    conteudo += "";

    if (resultado.mantras?.[13]) {
      conteudo += resultado.mantras[13].trim() + "\n\n";
    }

    conteudo += adicionarLista(
      "",
      resultado.miasmas
    );

  }



  /*
  ------------------------------------------------
  ENCERRAMENTO
  ------------------------------------------------
  */

  if (resultado.mantras?.[14]) {

    conteudo += "Mantra de encerramento\n\n";
    conteudo += resultado.mantras[14].trim() + "\n\n";

  }



  return dividirEmBlocos(conteudo, 12000);

}
