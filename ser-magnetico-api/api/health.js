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

    testar({
      curso: "dam",
      texto: "cartas:7 areasSistemicas:3 desativacoes:55 ativacoes:1"
    }),

    testar({
      curso: "espiritos",
      dados: { portais: [1], pactos: [2] }
    }),

    testar({
      curso: "biohumano",
      dados: { paresEmocionais: [32], reservatorios: [11] }
    }),

    testar({
      curso: "bioanimal",
      dados: {
        paresEmocionais: [32],
        reservatorios: [11],
        sistemas: [4],
        paresSistema: [{ sistema: 4, par: 10 }]
      }
    })

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
