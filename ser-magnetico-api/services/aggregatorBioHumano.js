const LIMITE = 8000;

function dividirTexto(texto = "") {

  const partes = [];

  if (!texto) return partes;

  if (texto.length <= LIMITE) {
    partes.push(texto.trim());
    return partes;
  }

  let inicio = 0;

  while (inicio < texto.length) {

    partes.push(
      texto.slice(inicio, inicio + LIMITE).trim()
    );

    inicio += LIMITE;

  }

  return partes;
}

export function aggregateBioHumano(resultado) {

  const blocos = [];



  /* -----------------------------
  PARES EMOCIONAIS
  ----------------------------- */

  if (resultado.paresEmocionais && Object.keys(resultado.paresEmocionais).length) {

    blocos.push("PARES EMOCIONAIS");

    for (const k of Object.keys(resultado.paresEmocionais)) {

      const texto = resultado.paresEmocionais[k];

      blocos.push(...dividirTexto(texto));

    }

  }



  /* -----------------------------
  RESERVATÓRIOS
  ----------------------------- */

  if (resultado.reservatorios && Object.keys(resultado.reservatorios).length) {

    blocos.push("RESERVATÓRIOS");

    for (const k of Object.keys(resultado.reservatorios)) {

      const texto = resultado.reservatorios[k];

      blocos.push(...dividirTexto(texto));

    }

  }



  /* -----------------------------
  RASTREIO GERAL
  ----------------------------- */

  if (resultado.rastreioGeral && Object.keys(resultado.rastreioGeral).length) {

    blocos.push("RASTREIO GERAL");

    for (const k of Object.keys(resultado.rastreioGeral)) {

      const texto = resultado.rastreioGeral[k];

      blocos.push(...dividirTexto(texto));

    }

  }



  /* -----------------------------
  SISTEMAS
  ----------------------------- */

  if (resultado.sistemas && Object.keys(resultado.sistemas).length) {

    blocos.push("SISTEMAS");

    for (const sistema of Object.keys(resultado.sistemas)) {

      const dadosSistema = resultado.sistemas[sistema];

      if (!dadosSistema) continue;

      if (dadosSistema.texto) {

        blocos.push(...dividirTexto(dadosSistema.texto));

      }

      if (dadosSistema.pares) {

        for (const par of Object.keys(dadosSistema.pares)) {

          const textoPar = dadosSistema.pares[par];

          blocos.push(...dividirTexto(textoPar));

        }

      }

    }

  }

  return blocos;

}
