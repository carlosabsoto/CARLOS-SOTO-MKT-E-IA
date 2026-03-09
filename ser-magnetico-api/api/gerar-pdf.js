import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Método não permitido"
      });
    }

    const { titulo, conteudo } = req.body;

    if (!conteudo) {
      return res.status(400).json({
        error: "Conteúdo não informado"
      });
    }

    // configuração serverless
    chromium.setGraphicsMode = false;

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    const html = `
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body{
          font-family: Arial;
          padding:40px;
          line-height:1.6;
        }

        h1{
          text-align:center;
        }

        pre{
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
      'attachment; filename="devolutiva.pdf"'
    );

    return res.send(pdf);

  } catch (error) {

    console.error("ERRO REAL PDF:", error);

    return res.status(500).json({
      error: "Erro ao gerar PDF",
      detalhe: error.message
    });

  }

}
