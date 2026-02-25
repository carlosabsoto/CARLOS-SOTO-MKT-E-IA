export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body || {};

    const emocionais = Array.isArray(body.emocionais) ? body.emocionais : [];
    const reservatorios = Array.isArray(body.reservatorios) ? body.reservatorios : [];
    const rastreios = Array.isArray(body.rastreios) ? body.rastreios : [];
    const sistemas = Array.isArray(body.sistemas) ? body.sistemas : [];
    const mantras = Array.isArray(body.mantras) ? body.mantras : [];

    const BASE = "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/main/";

    const fetchText = async (url) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return { erro: "Arquivo não encontrado" };
        return { conteudo: await r.text() };
      } catch (err) {
        return { erro: "Erro ao consultar GitHub" };
      }
    };

    const promises = [];

    // 🔹 Emocionais
    emocionais.forEach(n => {
      const url = `${BASE}BIO-ANIMAL/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.md`;
      promises.push(fetchText(url).then(r => ({
        categoria: "emocionais",
        numero: n,
        ...r
      })));
    });

    // 🔹 Reservatórios
    reservatorios.forEach(n => {
      const url = `${BASE}BIO-ANIMAL/RESERVATORIOS/RESERVATORIO-${n}.md`;
      promises.push(fetchText(url).then(r => ({
        categoria: "reservatorios",
        numero: n,
        ...r
      })));
    });

    // 🔹 Rastreios
    rastreios.forEach(n => {
      const url = `${BASE}BIO-ANIMAL/RASTREIO-GERAL/RASTREIO-GERAL-${n}.md`;
      promises.push(fetchText(url).then(r => ({
        categoria: "rastreios",
        numero: n,
        ...r
      })));
    });

    // 🔹 Sistemas
    sistemas.forEach(obj => {

      if (!obj || typeof obj.sistema === "undefined") return;

      // Buscar sistema base
      const sistemaUrl = `${BASE}BIO-ANIMAL/SISTEMAS/SISTEMA-${obj.sistema}.md`;

      promises.push(fetchText(sistemaUrl).then(r => ({
        categoria: "sistema_base",
        sistema: obj.sistema,
        ...r
      })));

      // Buscar pares se existirem
      if (Array.isArray(obj.pares)) {
        obj.pares.forEach(par => {
          const parUrl = `${BASE}BIO-ANIMAL/SISTEMAS/PARES/PAR-SISTEMA-${obj.sistema}-${par}.md`;
          promises.push(fetchText(parUrl).then(r => ({
            categoria: "sistema_par",
            sistema: obj.sistema,
            par,
            ...r
          })));
        });
      }

    });

    // 🔹 Mantras
    mantras.forEach(tipo => {
      const url = `${BASE}DAM/MANTRAS/MANTRA-${tipo}.txt`;
      promises.push(fetchText(url).then(r => ({
        categoria: "mantras",
        tipo,
        ...r
      })));
    });

    const resultados = await Promise.all(promises);

    return res.status(200).json({
      total: resultados.length,
      resultados
    });

  } catch (error) {

    console.error("Erro interno:", error);

    return res.status(500).json({
      error: "Erro interno da API",
      detalhe: error.message
    });
  }
}
