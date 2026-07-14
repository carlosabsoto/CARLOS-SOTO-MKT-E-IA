export function dividirEmBlocos(texto = "", tamanho = 12000) {
  const partes = [];
  let inicio = 0;

  while (inicio < texto.length) {
    partes.push(texto.slice(inicio, inicio + tamanho));
    inicio += tamanho;
  }

  return partes;
}

function adicionarLista(dados = {}) {
  let bloco = "";

  const lista = Object.values(dados).filter(
    item => typeof item === "string" && item.trim()
  );

  if (!lista.length) return "";

  lista.forEach(item => {
    bloco += item.trim() + "\n\n";
  });

  return bloco;
}

function adicionarMantras(resultado, numeros = []) {
  let bloco = "";

  for (const numero of numeros) {
    const mantra = resultado.mantras?.[numero];

    if (typeof mantra === "string" && mantra.trim()) {
      bloco += mantra.trim() + "\n\n";
    }
  }

  return bloco;
}

function possuiConteudo(objeto) {
  return (
    objeto &&
    typeof objeto === "object" &&
    Object.values(objeto).some(
      item => typeof item === "string" && item.trim()
    )
  );
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
    conteudo += adicionarMantras(resultado, [1]);
  }

  /*
  ------------------------------------------------
  PORTAIS
  Mantras possíveis: 2 e 3
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.fechamentoPortais)) {
    conteudo += adicionarMantras(resultado, [2, 3]);
    conteudo += adicionarLista(resultado.fechamentoPortais);
  }

  /*
  ------------------------------------------------
  PACTOS
  Mantra: 4
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.cancelamentoPactos)) {
    conteudo += adicionarMantras(resultado, [4]);
    conteudo += adicionarLista(resultado.cancelamentoPactos);
  }

  /*
  ------------------------------------------------
  ESPÍRITOS
  Mantras possíveis: 5 e 6
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.liberacaoEspiritos)) {
    conteudo += adicionarMantras(resultado, [5, 6]);
    conteudo += adicionarLista(resultado.liberacaoEspiritos);
  }

  /*
  ------------------------------------------------
  ENERGIAS DENSAS
  Mantras possíveis: 7 e 8
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.energiasDensas)) {
    conteudo += adicionarMantras(resultado, [7, 8]);
    conteudo += adicionarLista(resultado.energiasDensas);
  }

  /*
  ------------------------------------------------
  ASSOCIAÇÕES EMOCIONAIS
  Mantra: 9
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.associacaoEmocional)) {
    conteudo += adicionarMantras(resultado, [9]);
    conteudo += adicionarLista(resultado.associacaoEmocional);
  }

  /*
  ------------------------------------------------
  PSIQUISMO
  Mãe: mantra 10
  Pai: mantra 11
  ------------------------------------------------
  */

  conteudo += adicionarMantras(resultado, [10, 11]);

  /*
  ------------------------------------------------
  MIASMAS
  Mantras possíveis: 12 e 13
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.miasmas)) {
    conteudo += adicionarMantras(resultado, [12, 13]);
    conteudo += adicionarLista(resultado.miasmas);
  }

  /*
  ------------------------------------------------
  MANTRA DE ENCERRAMENTO
  ------------------------------------------------
  */

  if (resultado.mantras?.[14]) {
    conteudo += "Mantra de encerramento\n\n";
    conteudo += adicionarMantras(resultado, [14]);
  }

  return dividirEmBlocos(conteudo.trim(), 12000);
}
