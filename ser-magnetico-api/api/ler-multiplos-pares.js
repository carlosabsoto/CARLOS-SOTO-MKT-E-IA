export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sistema, pares } = req.body;

  if (!sistema || !Array.isArray(pares)) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  try {

    const baseUrl = "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/main/BIO-ANIMAL/SISTEMAS/PARES/";

    // 🔥 Execução paralela real
    const requests = pares.map(par => {
      const url = `${baseUrl}PAR-SISTEMA-${sistema}-${par}.md`;
      return fetch(url).then(r => {
        if (!r.ok) return { par, erro: "Arquivo não encontrado" };
        return r.text().then(text => ({ par, conteudo: text }));
      });
    });

    const resultados = await Promise.all(requests);

    return res.status(200).json({
      sistema,
      total: resultados.length,
      resultados
    });

  } catch (error) {
    return res.status(500).json({ error: 'Erro interno', detalhe: error.message });
  }
}
