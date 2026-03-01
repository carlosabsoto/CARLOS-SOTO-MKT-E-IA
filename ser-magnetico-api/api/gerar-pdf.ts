export const runtime = "nodejs";

export default async function handler(req, res) {

  try {

    if (req.method === "POST") {

      return res.status(200).json({
        ok: true,
        body: req.body
      });

    }

    return res.status(200).json({
      ok: true,
      message: "API ativa"
    });

  } catch (error) {

    console.error("ERRO:", error);

    return res.status(500).json({
      error: "Falha interna"
    });

  }

}
