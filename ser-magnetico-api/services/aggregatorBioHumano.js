function dividirTextoSeguro(texto) {

  if (!texto || typeof texto !== "string") {
    return []
  }

  const MAX = 12000

  const partes = texto.split("\n\n")

  const blocos = []
  let atual = ""

  for (const p of partes) {

    if ((atual + p).length > MAX) {
      blocos.push(atual)
      atual = p
    } else {
      atual += "\n\n" + p
    }

  }

  if (atual) blocos.push(atual)

  return blocos
}
