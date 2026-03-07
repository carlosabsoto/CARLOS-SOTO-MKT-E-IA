export function dividirEmBlocos(texto = "", tamanho = 8000) {

  const partes = [];
  let inicio = 0;

  while (inicio < texto.length) {
    partes.push(texto.slice(inicio, inicio + tamanho));
    inicio += tamanho;
  }

  return partes;

}

export function aggregateData(resultado, mantraAtivacao, mantraDesativacao) {

  const blocos = [];

  function adicionarCategoria(titulo, categoria) {

    const itens = resultado[categoria];

    if (!itens || Object.keys(itens).length === 0) return;

    blocos.push(`${titulo}`);

    for (const key of Object.keys(itens)) {

      const texto = itens[key];

      const partes = dividirEmBlocos(texto, 12000);

      blocos.push(...partes);

    }

  }

  // mantra de ativação primeiro
  if (mantraAtivacao) {

    const partes = dividirEmBlocos(
      `MANTRA DE ATIVAÇÃO\n\n${mantraAtivacao}`,
      12000
    );

    blocos.push(...partes);

  }

  adicionarCategoria("Cartas da Consciência", "cartas");
  adicionarCategoria("Áreas Sistêmicas", "areasSistemicas");
  adicionarCategoria("Áreas de Atuação", "areasDeAtuacao");
  adicionarCategoria("Desativações", "desativacoes");
  adicionarCategoria("Ativações", "ativacoes");

  // mantra de desativação por último
  if (mantraDesativacao) {

    const partes = dividirEmBlocos(
      `MANTRA DE DESATIVAÇÃO\n\n${mantraDesativacao}`,
      12000
    );

    blocos.push(...partes);

  }

  return blocos;

}
