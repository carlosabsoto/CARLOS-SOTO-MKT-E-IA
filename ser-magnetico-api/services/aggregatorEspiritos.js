const LIMITE_BLOCO = 6000;

function dividirTextoSeguro(texto = "") {

  const partes = [];
  let buffer = "";

  const paragrafos = texto.split("\n");

  for (const p of paragrafos) {

    const linha = p + "\n";

    if ((buffer + linha).length > LIMITE_BLOCO) {

      partes.push(buffer.trim());
      buffer = linha;

    } else {

      buffer += linha;

    }

  }

  if (buffer.trim().length > 0) {
    partes.push(buffer.trim());
  }

  return partes;

}

export function aggregateEspiritos(resultado, mantraAtivacao, mantraDesativacao) {

  const blocos = [];

  function adicionarCategoria(titulo, categoria) {

    const itens = resultado[categoria];

    if (!itens || Object.keys(itens).length === 0) return;

    blocos.push(titulo);

    for (const key of Object.keys(itens)) {

      const texto = itens[key];

      const partes = dividirTextoSeguro(texto);

      blocos.push(...partes);

    }

  }

  if (mantraAtivacao) {
    blocos.push("MANTRA DE ATIVAÇÃO\n\n" + mantraAtivacao);
  }

  adicionarCategoria("Fechamento de Portais e Buracos Energéticos", "fechamentoPortais");
  adicionarCategoria("Cancelamento de Pactos, Contratos e Compromissos", "cancelamentoPactos");
  adicionarCategoria("Liberação de Espíritos", "liberacaoEspiritos");
  adicionarCategoria("Energias Densas ou Diabólicas", "energiasDensas");
  adicionarCategoria("Associação Emocional", "associacaoEmocional");
  adicionarCategoria("Informação do Psiquismo da Mãe", "psiquismoMae");
  adicionarCategoria("Informação do Psiquismo do Pai", "psiquismoPai");
  adicionarCategoria("Miasmas e Cargas Eletromagnéticas", "miasmas");

  if (mantraDesativacao) {
    blocos.push("MANTRA DE DESATIVAÇÃO\n\n" + mantraDesativacao);
  }

  return blocos;

}
