const LIMITE_BLOCO = 6000;

function dividirTextoSeguro(texto = "") {

  if (!texto || typeof texto !== "string") return [];

  const partes = [];
  let buffer = "";

  const linhas = texto.split("\n");

  for (const l of linhas) {

    const linha = l + "\n";

    if ((buffer + linha).length > LIMITE_BLOCO) {

      partes.push(buffer.trim());
      buffer = linha;

    } else {

      buffer += linha;

    }

  }

  if (buffer.trim()) partes.push(buffer.trim());

  return partes;
}

export function aggregateBioHumano(resultado) {

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

  // categorias simples

  adicionarCategoria("Pares Emocionais", "paresEmocionais");
  adicionarCategoria("Reservatórios", "reservatorios");
  adicionarCategoria("Rastreio Geral", "rastreioGeral");

  // SISTEMAS

  if (resultado.sistemas) {

    blocos.push("SISTEMAS");

    for (const sistema of Object.keys(resultado.sistemas)) {

      const textoSistema = resultado.sistemas[sistema];

      // descrição do sistema
      const partesSistema = dividirTextoSeguro(textoSistema);
      blocos.push(...partesSistema);

      // pares do sistema
      if (resultado.paresSistema) {

        for (const chave of Object.keys(resultado.paresSistema)) {

          const [s, par] = chave.split("-");

          if (String(s) === String(sistema)) {

            const textoPar = resultado.paresSistema[chave];

            const partesPar = dividirTextoSeguro(textoPar);

            blocos.push(...partesPar);

          }

        }

      }

    }

  }

  return blocos;

}
