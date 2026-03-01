import PDFDocument from "pdfkit";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {

    const { titulo, conteudo } = req.body;

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=devolutiva.pdf");

    doc.pipe(res);

    doc.fontSize(20).text(titulo || "Devolutiva", {
      align: "center"
    });

    doc.moveDown();

    doc.fontSize(12).text(conteudo || "Conteúdo da devolutiva");

    doc.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao gerar PDF"
    });

  }

}
