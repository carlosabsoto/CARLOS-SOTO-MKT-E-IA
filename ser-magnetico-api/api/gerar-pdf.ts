import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { titulo, conteudo } = req.body;

  const fileName = `devolutiva-${Date.now()}.pdf`;
  const filePath = path.join("/tmp", fileName);

  const doc = new PDFDocument();

  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(18).text(titulo, {
    align: "center"
  });

  doc.moveDown();

  doc.fontSize(12).text(conteudo);

  doc.end();

  stream.on("finish", () => {

    res.status(200).json({
      pdf_url: `https://ias-ser-magnetico.vercel.app/api/download?file=${fileName}`
    });

  });

}
