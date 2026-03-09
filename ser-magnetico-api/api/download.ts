import fs from "fs";

export default async function handler(req, res) {

  try {

    const { file } = req.query;

    if (!file) {
      return res.status(400).json({
        erro: "Arquivo não informado"
      });
    }

    const filePath = `/tmp/${file}`;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        erro: "Arquivo não encontrado"
      });
    }

    const stream = fs.createReadStream(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file}"`
    );

    stream.pipe(res);

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    });

  }

}
