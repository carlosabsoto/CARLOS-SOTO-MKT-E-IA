import PDFDocument from "pdfkit";

export default async function handler(req, res) {

  try {

    if (req.method !== "GET") {
      return res.status(405).json({
        erro: "Método não permitido"
      });
    }

    const { titulo, conteudo } = req.query || {};

    if (!conteudo) {
      return res.status(400).json({
        erro: "Conteúdo não informado"
      });
    }

    const texto = Array.isArray(conteudo)
      ? conteudo.join("\n\n")
      : String(conteudo);

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {

      const pdfBuffer = Buffer.concat(buffers);

      res.setHeader("Content-Type", "application/pdf");

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="devolutiva-dam.pdf"'
      );

      res.send(pdfBuffer);

    });

    const dataSessao = new Date().toLocaleDateString("pt-BR");

    // CAPA
    doc.fontSize(28).text("SER MAGNÉTICO", { align: "center" });

    doc.moveDown();

    doc.fontSize(20).text(titulo || "Relatório da Sessão", {
      align: "center"
    });

    doc.moveDown(2);

    doc.fontSize(12).text(`Data da sessão: ${dataSessao}`, {
      align: "center"
    });

    doc.addPage();

    // RESULTADO
    doc.fontSize(18).text("RESULTADO DA SESSÃO", {
      underline: true
    });

    doc.moveDown();

    doc.fontSize(12).text(texto);

    doc.end();

  } catch (erro) {

    console.error("ERRO GERAR PDF:", erro);

    res.status(500).json({
      erro: erro.message
    });

  }

}
