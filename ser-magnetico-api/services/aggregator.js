const LIMITE_BLOCO = 6000;

function dividirTextoSeguro(texto = "") {

  if (!texto || typeof texto !== "string") {
    return [];
  }

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

export function aggregateData(resultado, mantraAtivacao, mantraDesativacao) {

  const blocos = [];

  function adicionarCategoria(titulo, categoria) {

    const itens = resultado[categoria];

    if (!itens || Object.keys(itens).length === 0) return;

    blocos.push(titulo);

    for (const key of Object.keys(itens)) {

      const texto = itens[key];

      if (typeof texto === "string") {

        const partes = dividirTextoSeguro(texto);
        blocos.push(...partes);

      }

    }

  }

  // mantra ativação primeiro
  if (mantraAtivacao) {

    const partes = dividirTextoSeguro(
      `MANTRA DE ATIVAÇÃO\n\n${mantraAtivacao}`
    );

    blocos.push(...partes);

  }

  adicionarCategoria("Cartas da Consciência", "cartas");
  adicionarCategoria("Áreas Sistêmicas", "areasSistemicas");
  adicionarCategoria("Áreas de Atuação", "areasDeAtuacao");
  adicionarCategoria("Desativações", "desativacoes");
  adicionarCategoria("Ativações", "ativacoes");

  adicionarCategoria("Pares Emocionais", "paresEmocionais");
  adicionarCategoria("Reservatórios", "reservatorios");
  adicionarCategoria("Rastreio Geral", "rastreioGeral");

  // SISTEMAS (estrutura especial para Bio Humano e Bio Animal)

  if (resultado.sistemas) {

    blocos.push("SISTEMAS");

    for (const sistema of Object.keys(resultado.sistemas)) {

      const s = resultado.sistemas[sistema];

      if (s.texto) {

        const partesSistema = dividirTextoSeguro(s.texto);
        blocos.push(...partesSistema);

      }

      if (s.pares) {

        for (const par of Object.keys(s.pares)) {

          const textoPar = s.pares[par];

          const partesPar = dividirTextoSeguro(textoPar);

          blocos.push(...partesPar);

        }

      }

    }

  }

  // mantra desativação por último
  if (mantraDesativacao) {

    const partes = dividirTextoSeguro(
      `MANTRA DE DESATIVAÇÃO\n\n${mantraDesativacao}`
    );

    blocos.push(...partes);

  }

  return blocos;

}
