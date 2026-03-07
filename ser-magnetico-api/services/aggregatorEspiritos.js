export function dividirEmBlocos(texto = "", tamanho = 8000) {

  const partes = [];
  let inicio = 0;

  while (inicio < texto.length) {

    partes.push(texto.slice(inicio, inicio + tamanho));
    inicio += tamanho;

  }

  return partes;

}


export function aggregateEspiritos(resultado = {}) {

  let conteudo = "";

  /*
  -----------------------------------
  MANTRA DE ABERTURA
  -----------------------------------
  */

  if (resultado.mantras?.[1]) {

    conteudo += "Mantra de abertura\n\n";
    conteudo += resultado.mantras[1] + "\n\n";

  }


  /*
  -----------------------------------
  PORTAIS
  -----------------------------------
  */

  if (resultado.fechamentoPortais) {

    conteudo += "Mantras condicionais dos Portais\n\n";

    if (resultado.mantras?.[2]) {
      conteudo += resultado.mantras[2] + "\n\n";
    }

    conteudo += "Resultado Portais\n\n";

    for (const key in resultado.fechamentoPortais) {

      conteudo += resultado.fechamentoPortais[key] + "\n\n";

    }

  }


  /*
  -----------------------------------
  PACTOS
  -----------------------------------
  */

  if (resultado.cancelamentoPactos) {

    conteudo += "Mantras condicionais dos Pactos\n\n";

    if (resultado.mantras?.[3]) {
      conteudo += resultado.mantras[3] + "\n\n";
    }

    conteudo += "Resultado Pactos\n\n";

    for (const key in resultado.cancelamentoPactos) {

      conteudo += resultado.cancelamentoPactos[key] + "\n\n";

    }

  }


  /*
  -----------------------------------
  ESPÍRITOS
  -----------------------------------
  */

  if (resultado.liberacaoEspiritos) {

    conteudo += "Mantras condicionais dos Espíritos\n\n";

    if (resultado.mantras?.[4]) {
      conteudo += resultado.mantras[4] + "\n\n";
    }

    conteudo += "Resultado Espíritos\n\n";

    for (const key in resultado.liberacaoEspiritos) {

      conteudo += resultado.liberacaoEspiritos[key] + "\n\n";

    }

  }


  /*
  -----------------------------------
  ENERGIAS DENSAS
  -----------------------------------
  */

  if (resultado.energiasDensas) {

    conteudo += "Mantras condicionais das Energias Densas\n\n";

    if (resultado.mantras?.[5]) {
      conteudo += resultado.mantras[5] + "\n\n";
    }

    conteudo += "Resultado Energias Densas\n\n";

    for (const key in resultado.energiasDensas) {

      conteudo += resultado.energiasDensas[key] + "\n\n";

    }

  }


  /*
  -----------------------------------
  ASSOCIAÇÕES
  -----------------------------------
  */

  if (resultado.associacaoEmocional) {

    conteudo += "Mantra das Associações\n\n";

    if (resultado.mantras?.[9]) {
      conteudo += resultado.mantras[9] + "\n\n";
    }

    conteudo += "Resultado Associação emocional\n\n";

    for (const key in resultado.associacaoEmocional) {

      conteudo += resultado.associacaoEmocional[key] + "\n\n";

    }

  }


  /*
  -----------------------------------
  PSIQUISMO
  -----------------------------------
  */

  if (resultado.mantras?.[10]) {

    conteudo += "Psiquismo da mãe\n\n";
    conteudo += resultado.mantras[10] + "\n\n";

  }

  if (resultado.mantras?.[11]) {

    conteudo += "Psiquismo do pai\n\n";
    conteudo += resultado.mantras[11] + "\n\n";

  }


  /*
  -----------------------------------
  MIASMAS
  -----------------------------------
  */

  if (resultado.miasmas) {

    conteudo += "Mantras condicionais dos miasmas\n\n";

    if (resultado.mantras?.[13]) {
      conteudo += resultado.mantras[13] + "\n\n";
    }

    conteudo += "Resultado Miasmas\n\n";

    for (const key in resultado.miasmas) {

      conteudo += resultado.miasmas[key] + "\n\n";

    }

  }


  /*
  -----------------------------------
  ENCERRAMENTO
  -----------------------------------
  */

  if (resultado.mantras?.[14]) {

    conteudo += "Mantra de encerramento\n\n";
    conteudo += resultado.mantras[14] + "\n\n";

  }


  return dividirEmBlocos(conteudo, 12000);

}
