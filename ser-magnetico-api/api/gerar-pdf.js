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
      margin: 50,
      size: "A4"
    });

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {

      const pdfBuffer = Buffer.concat(buffers);
      const base64 = pdfBuffer.toString("base64");

      res.status(200).json({
        success: true,
        filename: "relatorio-ser-magnetico.pdf",
        file: base64
      });

    });

    const dataSessao = new Date().toLocaleDateString("pt-BR");

    // CAPA
    doc
      .fontSize(28)
      .text("SER MAGNÉTICO", { align: "center" });

    doc.moveDown();

    doc
      .fontSize(20)
      .text(titulo || "Relatório da Sessão", { align: "center" });

    doc.moveDown(2);

    doc
      .fontSize(12)
      .text(`Data da sessão: ${dataSessao}`, { align: "center" });

    doc.addPage();

    // SEÇÃO RESULTADO TÉCNICO
    doc
      .fontSize(18)
      .text("RESULTADO DA SESSÃO", { underline: true });

    doc.moveDown();

    const texto = Array.isArray(conteudo)
      ? conteudo.join("\n\n")
      : conteudo;

    doc
      .fontSize(12)
      .text(texto, {
        align: "left",
        width: 500
      });

    doc.moveDown(2);

    // RODAPÉ
    doc
      .fontSize(10)
      .text("Ser Magnético", 50, doc.page.height - 50, {
        align: "center"
      });

    doc.end();

  } catch (erro) {

    console.error("ERRO GERAR PDF:", erro);

    return res.status(500).json({
      success: false,
      erro: erro.message
    });

  }
}
