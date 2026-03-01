import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const runtime = "nodejs";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {

    const { titulo, conteudo } = req.body;

    const html = `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body{
            font-family: Arial;
            padding:40px;
          }
          h1{
            text-align:center;
          }
          p{
            font-size:18px;
          }
        </style>
      </head>

      <body>

        <h1>${titulo}</h1>

        <p>${conteudo}</p>

      </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0"
    });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=devolutiva.pdf"
    );

    res.status(200).send(pdf);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao gerar PDF"
    });

  }

}
