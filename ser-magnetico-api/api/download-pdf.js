import fs from "fs";

export default async function handler(req, res) {

  const { file } = req.query;

  const path = `/tmp/${file}`;

  if (!fs.existsSync(path)) {
    return res.status(404).json({
      erro: "Arquivo não encontrado"
    });
  }

  const stream = fs.createReadStream(path);

  res.setHeader("Content-Type", "application/pdf");

  stream.pipe(res);

}
