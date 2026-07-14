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

  const lista = Object.values(dados || {}).filter(
    item => typeof item === "string" && item.trim()
  );

  if (!lista.length) return "";

  if (titulo) {
    bloco += titulo + "\n\n";
  }

  lista.forEach(item => {
    bloco += item.trim() + "\n\n";
  });

  return bloco;
}

function adicionarMantra(resultado = {}, numero) {
  const mantra = resultado.mantras?.[numero];

  if (typeof mantra !== "string" || !mantra.trim()) {
    return "";
  }

  return mantra.trim() + "\n\n";
}

function possuiConteudo(dados = {}) {
  return Object.values(dados || {}).some(
    item => typeof item === "string" && item.trim()
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
    conteudo += adicionarMantra(resultado, 1);
  }

  /*
  ------------------------------------------------
  PORTAIS
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.fechamentoPortais)) {
    conteudo += adicionarMantra(resultado, 2);
    conteudo += adicionarMantra(resultado, 3);

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

  if (possuiConteudo(resultado.cancelamentoPactos)) {
    conteudo += adicionarMantra(resultado, 4);

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

  if (possuiConteudo(resultado.liberacaoEspiritos)) {
    conteudo += adicionarMantra(resultado, 5);
    conteudo += adicionarMantra(resultado, 6);

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

  if (possuiConteudo(resultado.energiasDensas)) {
    conteudo += adicionarMantra(resultado, 7);
    conteudo += adicionarMantra(resultado, 8);

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

  if (possuiConteudo(resultado.associacaoEmocional)) {
    conteudo += adicionarMantra(resultado, 9);

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

  conteudo += adicionarMantra(resultado, 10);
  conteudo += adicionarMantra(resultado, 11);

  /*
  ------------------------------------------------
  MIASMAS
  ------------------------------------------------
  */

  if (possuiConteudo(resultado.miasmas)) {
    conteudo += adicionarMantra(resultado, 12);
    conteudo += adicionarMantra(resultado, 13);

    conteudo += adicionarLista(
      "",
      resultado.miasmas
    );
  }

  /*
  ------------------------------------------------
  MANTRA DE ENCERRAMENTO
  ------------------------------------------------
  */

  if (resultado.mantras?.[14]) {
    conteudo += "Mantra de encerramento\n\n";
    conteudo += adicionarMantra(resultado, 14);
  }

  return dividirEmBlocos(conteudo.trim(), 12000);
}
