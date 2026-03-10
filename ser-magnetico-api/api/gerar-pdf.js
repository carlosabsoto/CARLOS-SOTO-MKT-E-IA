import PDFDocument from "pdfkit";
import fs from "fs";

export default async function handler(req, res) {

  try {

    const { titulo, conteudo } = req.query || {};

    if (!conteudo) {
      return res.status(400).json({
        success: false,
        erro: "Conteúdo não informado"
      });
    }

    const fileName = `devolutiva-${Date.now()}.pdf`;
    const filePath = `/tmp/${fileName}`;

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text(titulo || "Devolutiva", {
      align: "center"
    });

    doc.moveDown();

    doc.fontSize(12).text(conteudo);

    doc.end();

    stream.on("finish", () => {

      const url =
        `https://ias-ser-magnetico.vercel.app/api/download-pdf?file=${fileName}`;

      res.json({
        success: true,
        url: url
      });

    });

  } catch (erro) {

    res.status(500).json({
      success: false,
      erro: erro.message
    });

  }

}
