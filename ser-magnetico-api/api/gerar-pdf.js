import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

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

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
          }
          h1 {
            text-align: center;
          }
          pre {
            white-space: pre-wrap;
            font-family: inherit;
          }
        </style>
      </head>
      <body>

      <h1>${titulo || "Devolutiva"}</h1>

      <pre>${conteudo}</pre>

      </body>
      </html>
    `;

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="devolutiva.pdf"`
    );

    return res.status(200).send(pdf);

  } catch (erro) {

    console.error("ERRO GERAR PDF:", erro);

    return res.status(500).json({
      success: false,
      erro: "Falha ao gerar PDF"
    });

  }

}
