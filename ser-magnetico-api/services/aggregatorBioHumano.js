const LIMITE_BLOCO = 8000;

function dividirTextoIntegral(texto = "") {
  if (!texto || typeof texto !== "string") return [];

  const textoLimpo = texto.trim();
  if (!textoLimpo) return [];

  if (textoLimpo.length <= LIMITE_BLOCO) {
    return [textoLimpo];
  }

  const blocos = [];
  let restante = textoLimpo;

  while (restante.length > LIMITE_BLOCO) {
    let corte = restante.lastIndexOf("\n\n", LIMITE_BLOCO);

    if (corte === -1) {
      corte = restante.lastIndexOf("\n", LIMITE_BLOCO);
    }

    if (corte === -1) {
      corte = LIMITE_BLOCO;
    }

    const parte = restante.slice(0, corte).trim();

    if (parte) {
      blocos.push(parte);
    }

    restante = restante.slice(corte).trim();
  }

  if (restante) {
    blocos.push(restante);
  }

  return blocos;
}

function adicionarCategoriaIntegral(blocos, titulo, itens) {
  if (!itens || Object.keys(itens).length === 0) return;

  blocos.push(titulo);

  for (const chave of Object.keys(itens)) {
    const texto = itens[chave];
    blocos.push(...dividirTextoIntegral(texto));
  }
}

export function aggregateBioHumano(resultado) {
  const blocos = [];

  /*
  1️⃣ COMPLEXOS E PROTOCOLOS
  */

  if (resultado.protocolos && Object.keys(resultado.protocolos).length > 0) {
    adicionarCategoriaIntegral(
      blocos,
      "COMPLEXOS E PROTOCOLOS",
      resultado.protocolos
    );
  }

  /*
  2️⃣ PARES EMOCIONAIS
  */

  adicionarCategoriaIntegral(
    blocos,
    "PARES EMOCIONAIS",
    resultado.paresEmocionais
  );

  /*
  3️⃣ RESERVATÓRIOS
  */

  adicionarCategoriaIntegral(
    blocos,
    "RESERVATÓRIOS",
    resultado.reservatorios
  );

  /*
  4️⃣ RASTREIO GERAL
  */

  adicionarCategoriaIntegral(
    blocos,
    "RASTREIO GERAL",
    resultado.rastreioGeral
  );

  /*
  5️⃣ SISTEMAS
  */

  if (resultado.sistemas && Object.keys(resultado.sistemas).length > 0) {

    blocos.push("SISTEMAS");

    for (const sistema of Object.keys(resultado.sistemas)) {

      const dadosSistema = resultado.sistemas[sistema];
      if (!dadosSistema) continue;

      if (dadosSistema.texto) {
        blocos.push(...dividirTextoIntegral(dadosSistema.texto));
      }

      if (dadosSistema.pares && Object.keys(dadosSistema.pares).length > 0) {

        for (const par of Object.keys(dadosSistema.pares)) {

          const textoPar = dadosSistema.pares[par];
          blocos.push(...dividirTextoIntegral(textoPar));

        }

      }

    }

  }

  return blocos;
}
