import PDFDocument from "pdfkit";
import fs from "fs";

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

    const fileName = `devolutiva-${Date.now()}.pdf`;
    const filePath = `/tmp/${fileName}`;

    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc
      .fontSize(20)
      .text(titulo || "Devolutiva", {
        align: "center"
      });

    doc.moveDown(2);

    doc
      .fontSize(12)
      .text(conteudo, {
        align: "left",
        width: 500
      });

    doc.end();

    stream.on("finish", () => {

      const url = `https://ias-ser-magnetico.vercel.app/api/download?file=${fileName}`;

      return res.status(200).json({
        success: true,
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
