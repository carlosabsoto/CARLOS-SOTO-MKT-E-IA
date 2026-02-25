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

    const BASE = "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/main/";

    const fetchText = async (url) => {
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        return await r.text();
      } catch {
        return null;
      }
    };

    const resultado = {
      emocionais: {},
      reservatorios: {},
      rastreios: {},
      sistemas: {},
      total_arquivos: 0
    };

    const promises = [];

    // 🔹 Emocionais
    emocionais.forEach(n => {
      const url = `${BASE}BIO-ANIMAL/PARES-EMOCIONAIS/PAR-EMOCIONAL-${n}.md`;
      promises.push(
        fetchText(url).then(text => {
          if (text) {
            resultado.emocionais[n] = text;
            resultado.total_arquivos++;
          }
        })
      );
    });

    // 🔹 Reservatórios
    reservatorios.forEach(n => {
      const url = `${BASE}BIO-ANIMAL/RESERVATORIOS/RESERVATORIO-${n}.md`;
      promises.push(
        fetchText(url).then(text => {
          if (text) {
            resultado.reservatorios[n] = text;
            resultado.total_arquivos++;
          }
        })
      );
    });

    // 🔹 Rastreios
    rastreios.forEach(n => {
      const url = `${BASE}BIO-ANIMAL/RASTREIO-GERAL/RASTREIO-GERAL-${n}.md`;
      promises.push(
        fetchText(url).then(text => {
          if (text) {
            resultado.rastreios[n] = text;
            resultado.total_arquivos++;
          }
        })
      );
    });

    // 🔹 Sistemas
    sistemas.forEach(obj => {

      if (!obj || typeof obj.sistema === "undefined") return;

      const sistemaId = obj.sistema;

      resultado.sistemas[sistemaId] = {
        base: null,
        pares: {}
      };

      // Base do sistema
      const sistemaUrl = `${BASE}BIO-ANIMAL/SISTEMAS/SISTEMA-${sistemaId}.md`;

      promises.push(
        fetchText(sistemaUrl).then(text => {
          if (text) {
            resultado.sistemas[sistemaId].base = text;
            resultado.total_arquivos++;
          }
        })
      );

      // Pares
      if (Array.isArray(obj.pares)) {
        obj.pares.forEach(par => {
          const parUrl = `${BASE}BIO-ANIMAL/SISTEMAS/PARES/PAR-SISTEMA-${sistemaId}-${par}.md`;

          promises.push(
            fetchText(parUrl).then(text => {
              if (text) {
                resultado.sistemas[sistemaId].pares[par] = text;
                resultado.total_arquivos++;
              }
            })
          );
        });
      }

    });

    await Promise.all(promises);

    return res.status(200).json(resultado);

  } catch (error) {

    console.error("Erro interno:", error);

    return res.status(500).json({
      error: "Erro interno da API",
      detalhe: error.message
    });
  }
}
