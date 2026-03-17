function dividirEmBlocos(texto = "", tamanho = 12000) {

  const partes = []
  let inicio = 0

  while (inicio < texto.length) {
    partes.push(texto.slice(inicio, inicio + tamanho))
    inicio += tamanho
  }

  return partes

}



export function aggregateBioAnimal(resultado = {}) {

  let conteudo = ""



  /*
  -------------------------
  PARES EMOCIONAIS
  -------------------------
  */

  const emocionais = Object.values(resultado.paresEmocionais || {})

  if (emocionais.length) {

    conteudo += "Pares emocionais\n\n"

    emocionais.forEach(v => {
      if (v && v.trim()) {
        conteudo += v.trim() + "\n"
      }
    })

    conteudo += "\n"
  }



  /*
  -------------------------
  RESERVATÓRIOS
  -------------------------
  */

  const reservatorios = Object.values(resultado.reservatorios || {})

  if (reservatorios.length) {

    conteudo += "Reservatórios\n\n"

    reservatorios.forEach(v => {
      if (v && v.trim()) {
        conteudo += v.trim() + "\n"
      }
    })

    conteudo += "\n"
  }



  /*
  -------------------------
  RASTREIO GERAL
  -------------------------
  */

  const geral = Object.values(resultado.rastreioGeral || {})

  if (geral.length) {

    conteudo += "Rastreio geral\n\n"

    geral.forEach(v => {
      if (v && v.trim()) {
        conteudo += v.trim() + "\n"
      }
    })

    conteudo += "\n"
  }



  /*
  -------------------------
  SISTEMAS + PARES
  -------------------------
  */

  const sistemas = resultado.sistemas || {}

  const sistemasOrdenados = Object.keys(sistemas)
    .sort((a, b) => Number(a) - Number(b))

  for (const sistema of sistemasOrdenados) {

    const dadosSistema = sistemas[sistema]
    if (!dadosSistema) continue

    // Título do sistema
    conteudo += `Sistema ${sistema}\n\n`

    // Texto do sistema
    if (dadosSistema.texto && dadosSistema.texto.trim()) {
      conteudo += dadosSistema.texto.trim() + "\n\n"
    }

    // Pares do sistema
    const pares = dadosSistema.pares || {}

    const paresOrdenados = Object.keys(pares)
      .sort((a, b) => Number(a) - Number(b))

    for (const parId of paresOrdenados) {

      const parTexto = pares[parId]

      if (parTexto && parTexto.trim()) {
        conteudo += `Par ${parId}\n\n`
        conteudo += parTexto.trim() + "\n\n"
      }

    }

  }



  return dividirEmBlocos(conteudo.trim())

}
