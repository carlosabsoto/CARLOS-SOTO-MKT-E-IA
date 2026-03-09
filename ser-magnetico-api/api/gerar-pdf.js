import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

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

    const texto = Array.isArray(conteudo)
      ? conteudo.join("\n\n")
      : String(conteudo);

    const fileName = `devolutiva-${Date.now()}.pdf`;

    const pdfPath = path.join(process.cwd(), "public", "pdfs", fileName);

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    const dataSessao = new Date().toLocaleDateString("pt-BR");

    // CAPA
    doc.fontSize(28).text("SER MAGNÉTICO", { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text(titulo || "Relatório da Sessão", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(12).text(`Data da sessão: ${dataSessao}`, { align: "center" });

    doc.addPage();

    // CONTEÚDO
    doc.fontSize(18).text("RESULTADO DA SESSÃO", { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(texto, {
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

    stream.on("finish", () => {

      const url = `https://ias-ser-magnetico.vercel.app/pdfs/${fileName}`;

      return res.status(200).json({
        success: true,
        filename: fileName,
        url: url
      });

    });

  } catch (erro) {

    console.error("ERRO GERAR PDF:", erro);

    return res.status(500).json({
      success: false,
      erro: erro.message
    });

  }
}
