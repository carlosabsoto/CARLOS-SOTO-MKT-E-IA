export function aggregateData(resultado, mantraAtivacao, mantraDesativacao) {

  const blocos = [];

  // mantra de ativação primeiro
  if (mantraAtivacao) {
    blocos.push(
      "MANTRA DE ATIVAÇÃO\n\n" + mantraAtivacao
    );
  }

  function adicionarCategoria(titulo, categoria) {

    const itens = resultado[categoria];

    if (!itens || Object.keys(itens).length === 0) return;

    const texto = Object.values(itens).join("\n\n");

    blocos.push(`${titulo}\n\n${texto}`);
  }

  adicionarCategoria("Cartas da Consciência", "cartas");
  adicionarCategoria("Áreas Sistêmicas", "areasSistemicas");
  adicionarCategoria("Áreas de Atuação", "areasDeAtuacao");
  adicionarCategoria("Desativações", "desativacoes");
  adicionarCategoria("Ativações", "ativacoes");

  // mantra de desativação por último
  if (mantraDesativacao) {
    blocos.push(
      "MANTRA DE DESATIVAÇÃO\n\n" + mantraDesativacao
    );
  }

  return blocos;
}
