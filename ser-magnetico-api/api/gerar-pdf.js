import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });
    }

    const { titulo, conteudo } = req.body;

    if (!conteudo) {
      return res.status(400).json({
        success: false,
        erro: "Conteúdo não informado"
      });
    }

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="devolutiva.pdf"'
      );

      res.send(pdfData);
    });

    // Título
    doc
      .fontSize(20)
      .text(titulo || "Devolutiva", {
        align: "center"
      });

    doc.moveDown(2);

    // Conteúdo principal
    doc
      .fontSize(12)
      .text(conteudo, {
        align: "left"
      });

    doc.end();

  } catch (erro) {

    console.error("ERRO GERAR PDF:", erro);

    return res.status(500).json({
      success: false,
      erro: "Erro ao gerar PDF",
      detalhe: erro.message
    });

  }
}
