import fs from "fs";
import path from "path";

export default function handler(req, res) {

  const { file } = req.query;

  const filePath = path.join("/tmp", file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("Arquivo não encontrado");
  }

  res.setHeader("Content-Type", "application/pdf");

  const fileStream = fs.createReadStream(filePath);

  fileStream.pipe(res);

}
