import PDFDocument from "pdfkit";

export const runtime = "nodejs";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Use POST"
    });
  }

  try {

    const { titulo, conteudo } = req.body || {};

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=devolutiva.pdf"
    );

    doc.pipe(res);

    doc
      .fontSize(20)
      .text(titulo || "Devolutiva", {
        align: "center"
      });

    doc.moveDown();

    doc
      .fontSize(12)
      .text(conteudo || "Conteúdo da devolutiva");

    doc.end();

  } catch (erro) {

    console.error("Erro PDF:", erro);

    res.status(500).json({
      erro: "Falha ao gerar PDF"
    });

  }

}
