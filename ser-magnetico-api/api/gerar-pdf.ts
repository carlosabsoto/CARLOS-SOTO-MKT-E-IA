export const runtime = "nodejs";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {

    const { titulo = "Devolutiva", conteudo = "Teste de PDF" } = req.body || {};

    const pdf = `
%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 24 Tf
100 700 Td
(${titulo}) Tj
0 -40 Td
(${conteudo}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
9
%%EOF
`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=devolutiva.pdf");

    res.status(200).send(pdf);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      erro: "Erro ao gerar PDF"
    });

  }

}
