export default async function handler(req, res) {

  const url = "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/main/DAM/MANTRAS/MANTRA-DESATIVACAO.txt";

  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(404).json({ error: "Arquivo não encontrado" });
    }

    const text = await r.text();

    return res.status(200).send(text);

  } catch (error) {
    return res.status(500).json({ error: "Erro interno" });
  }
}
