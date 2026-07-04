function dividirEmBlocos(texto = "", tamanho = 12000) {
  const partes = [];
  let inicio = 0;

  while (inicio < texto.length) {
    partes.push(texto.slice(inicio, inicio + tamanho));
    inicio += tamanho;
  }

  return partes;
}

export function aggregateBioAnimal(resultado = {}) {

  let conteudo = "";

  /*
  -------------------------
  PARES EMOCIONAIS
  -------------------------
  */
  const emocionais = Object.values(resultado.paresEmocionais || {});

  if (emocionais.length) {
    conteudo += "Pares emocionais\n\n";

    emocionais.forEach(v => {
      if (typeof v === "string" && v.trim()) {
        conteudo += v.trim() + "\n";
      }
    });

    conteudo += "\n";
  }

  /*
  -------------------------
  RESERVATÓRIOS
  -------------------------
  */
  const reservatorios = Object.values(resultado.reservatorios || {});

  if (reservatorios.length) {
    conteudo += "Reservatórios\n\n";

    reservatorios.forEach(v => {
      if (typeof v === "string" && v.trim()) {
        conteudo += v.trim() + "\n";
      }
    });

    conteudo += "\n";
  }

  /*
  -------------------------
  RASTREIO GERAL
  -------------------------
  */
  const geral = Object.values(resultado.rastreioGeral || {});

  if (geral.length) {
    conteudo += "Rastreio geral\n\n";

    geral.forEach(v => {
      if (typeof v === "string" && v.trim()) {
        conteudo += v.trim() + "\n";
      }
    });

    conteudo += "\n";
  }

  /*
  -------------------------
  SISTEMAS
  -------------------------
  */
  const sistemas = resultado.sistemas || {};

  const sistemasOrdenados = Object.keys(sistemas)
    .sort((a, b) => Number(a) - Number(b));

  if (sistemasOrdenados.length) {

    conteudo += "Sistemas\n\n";

    for (const sistema of sistemasOrdenados) {

      const dadosSistema = sistemas[sistema];

      if (!dadosSistema) continue;

      if (
        typeof dadosSistema.texto === "string" &&
        dadosSistema.texto.trim()
      ) {
        conteudo += dadosSistema.texto.trim() + "\n\n";
      }

      const pares = dadosSistema.pares || {};

      const paresOrdenados = Object.keys(pares)
        .sort((a, b) => Number(a) - Number(b));

      for (const parId of paresOrdenados) {

        const parTexto = pares[parId];

        if (
          typeof parTexto === "string" &&
          parTexto.trim()
        ) {
          conteudo += parTexto.trim() + "\n\n";
        }
      }
    }
  }

  // Remove espaços extras
  const textoFinal = conteudo.trim();

  // Nenhum conteúdo encontrado
  if (!textoFinal) {
    console.warn("⚠️ aggregateBioAnimal: nenhum conteúdo foi montado.");
    return [];
  }

  const blocos = dividirEmBlocos(textoFinal);

  console.log("✅ aggregateBioAnimal:", {
    blocos: blocos.length,
    caracteres: textoFinal.length
  });

  return blocos;
}
