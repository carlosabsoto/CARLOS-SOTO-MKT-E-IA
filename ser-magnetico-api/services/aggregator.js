export function dividirEmBlocos(texto = "", tamanho = 20000) {
  const partes = [];
  let inicio = 0;

  while (inicio < texto.length) {
    partes.push(texto.slice(inicio, inicio + tamanho));
    inicio += tamanho;
  }

  return partes;
}

export function aggregateData(resultado, mantraAtivacao, mantraDesativacao) {

  let conteudo = "";

  if (resultado.cartas) {
    for (const key in resultado.cartas) {
      conteudo += resultado.cartas[key] + "\n\n";
    }
  }

  if (resultado.areasSistemicas) {
    for (const key in resultado.areasSistemicas) {
      conteudo += resultado.areasSistemicas[key] + "\n\n";
    }
  }

  if (resultado.areasDeAtuacao) {
    for (const key in resultado.areasDeAtuacao) {
      conteudo += resultado.areasDeAtuacao[key] + "\n\n";
    }
  }

  if (resultado.desativacoes) {
    for (const key in resultado.desativacoes) {
      conteudo += resultado.desativacoes[key] + "\n\n";
    }
  }

  if (resultado.ativacoes) {
    for (const key in resultado.ativacoes) {
      conteudo += resultado.ativacoes[key] + "\n\n";
    }
  }

  if (mantraAtivacao) {
    conteudo += "\nMANTRA DE ATIVAÇÃO\n";
    conteudo += mantraAtivacao + "\n\n";
  }

  if (mantraDesativacao) {
    conteudo += "\nMANTRA DE DESATIVAÇÃO\n";
    conteudo += mantraDesativacao + "\n\n";
  }

  const blocos = dividirEmBlocos(conteudo, 20000);

  return blocos;
}
