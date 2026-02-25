export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    emocionais = [],
    reservatorios = [],
    rastreios = [],
    sistemas = [],
    mantras = []
  } = req.body;

  const BASE = "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/main/";

  const fetchText = async (url) => {
    try {
      const r = await fetch(url);
      if (!r.ok) return { erro: "Arquivo não encontrado" };
      return { conteudo: await r.text() };
    } catch {
      return { erro: "Erro ao consultar GitHub" };
    }
  };

  const promises = [];

  // 🔹 Emocionais
  emocionais.forEach(n => {
    const url = `${BASE}BIO-ANIMAL/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.md`;
    promises.push(
      fetchText(url).then(r => ({
        categoria: "emocionais",
        numero: n,
        ...r
      }))
    );
  });

  // 🔹 Reservatórios
  reservatorios.forEach(n => {
    const url = `${BASE}BIO-ANIMAL/RESERVATORIOS/RESERVATORIO-${n}.md`;
    promises.push(
      fetchText(url).then(r => ({
        categoria: "reservatorios",
        numero: n,
        ...r
      }))
    );
  });

  // 🔹 Rastreio Geral
  rastreios.forEach(n => {
    const url = `${BASE}BIO-ANIMAL/RASTREIO-GERAL/RASTREIO-GERAL-${n}.md`;
    promises.push(
      fetchText(url).then(r => ({
        categoria: "rastreios",
        numero: n,
        ...r
      }))
    );
  });

  // 🔹 Sistemas + Pares
  sistemas.forEach(obj => {
    obj.pares.forEach(par => {
      const url = `${BASE}BIO-ANIMAL/SISTEMAS/PARES/PAR-SISTEMA-${obj.sistema}-${par}.md`;
      promises.push(
        fetchText(url).then(r => ({
          categoria: "sistemas",
          sistema: obj.sistema,
          par,
          ...r
        }))
      );
    });
  });

  // 🔹 Mantras
  mantras.forEach(tipo => {
    const url = `${BASE}DAM/MANTRAS/MANTRA-${tipo}.txt`;
    promises.push(
      fetchText(url).then(r => ({
        categoria: "mantras",
        tipo,
        ...r
      }))
    );
  });

  const resultados = await Promise.all(promises);

  return res.status(200).json({
    total: resultados.length,
    resultados
  });
}
