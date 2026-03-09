import PDFDocument from "pdfkit";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });
    }

    const { titulo, conteudo } = req.body || {};

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

    doc.on("data", (chunk) => buffers.push(chunk));

    doc.on("end", () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        const base64 = pdfBuffer.toString("base64");

        return res.status(200).json({
          success: true,
          filename: "relatorio-ser-magnetico.pdf",
          url: `data:application/pdf;base64,${base64}`
        });
      } catch (erro) {
        console.error("ERRO FINALIZAR PDF:", erro);

        return res.status(500).json({
          success: false,
          erro: "Falha ao finalizar PDF",
          detalhe: erro.message
        });
      }
    });

    const dataSessao = new Date().toLocaleDateString("pt-BR");

    const texto = Array.isArray(conteudo)
      ? conteudo.join("\n\n")
      : String(conteudo);

    // CAPA
    doc
      .fontSize(28)
      .text("SER MAGNÉTICO", {
        align: "center"
      });

    doc.moveDown();

    doc
      .fontSize(20)
      .text(titulo || "Relatório da Sessão", {
        align: "center"
      });

    doc.moveDown(2);

    doc
      .fontSize(12)
      .text(`Data da sessão: ${dataSessao}`, {
        align: "center"
      });

    doc.addPage();

    // CONTEÚDO
    doc
      .fontSize(18)
      .text("RESULTADO DA SESSÃO", {
        underline: true
      });

    doc.moveDown();

    doc
      .fontSize(12)
      .text(texto, {
        align: "left",
        width: 500
      });

    // RODAPÉ
    doc.fontSize(10).text(
      "Ser Magnético",
      50,
      doc.page.height - 50,
      { align: "center" }
    );

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
