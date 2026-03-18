const BASE_URL = "https://ias-ser-magnetico.vercel.app/api/rastreio";

async function testar(body) {
  try {

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    return res.status === 200 &&
           data.success === true &&
           Array.isArray(data.resultado) &&
           data.resultado.length > 0;

  } catch {
    return false;
  }
}

export default async function handler(req, res) {

  const inicio = Date.now();

  const [dam, espiritos, bioHumano, bioAnimal] = await Promise.all([

    testar(`${BASE_URL}?curso=dam&texto=cartas:7 areasSistemicas:3`),

    testar(`${BASE_URL}?curso=espiritos&portais=1&pactos=2`),

    testar(`${BASE_URL}?curso=biohumano&paresEmocionais=32`),

    testar(`${BASE_URL}?curso=bioanimal&sistemas=4&paresSistema[0][sistema]=4&paresSistema[0][par]=10`)

  ]);

  const tempo = Date.now() - inicio;

  const statusGeral = dam && espiritos && bioHumano && bioAnimal;

  res.status(200).json({
    status: statusGeral ? "ok" : "degradado",
    tempoMs: tempo,
    cursos: {
      dam,
      espiritos,
      bioHumano,
      bioAnimal
    },
    timestamp: new Date().toISOString()
  });

}
