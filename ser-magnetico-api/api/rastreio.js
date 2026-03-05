import espiritosPaths, { resolvePath as resolveEspiritos } from "../domains/espiritos-miasmas/paths.js";
import damPaths, { resolvePath as resolveDam } from "../domains/dam/paths.js";
import bioHumanoPaths, { resolvePath as resolveBioHumano } from "../domains/bio-humano/paths.js";
import bioAnimalPaths, { resolvePath as resolveBioAnimal } from "../domains/bio-animal/paths.js";

import { aggregateData } from "../services/aggregator.js";
import { fetchFromGitHub } from "../services/githubService.js";


function normalize(text = "") {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}


export default async function handler(req, res) {

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });
    }

    console.log("BODY RECEBIDO:", JSON.stringify(req.body, null, 2));

    const body = req.body || {};
    let { curso, dados } = body;


    // 🔒 curso obrigatório
    if (!curso) {
      return res.status(400).json({
        success: false,
        erro: "Campo 'curso' é obrigatório"
      });
    }


    // 🔒 validação de dados
    if (!dados || typeof dados !== "object") {
      return res.status(400).json({
        success: false,
        erro: "Campo 'dados' inválido ou ausente"
      });
    }

    if (Object.keys(dados).length === 0) {
      return res.status(400).json({
        success: false,
        erro: "Nenhum dado de rastreio informado"
      });
    }


    const rawCurso = String(curso)
      .trim()
      .toLowerCase()
      .replace(/[_\s]/g, "-")
      .replace(/--+/g, "-");


    const cursoMap = {

      dam: "dam",

      "bio-humano": "bio-humano",
      biohumano: "bio-humano",

      "bio-animal": "bio-animal",
      bioanimal: "bio-animal",

      "espiritos-miasmas": "espiritos-miasmas",
      espiritosmiasmas: "espiritos-miasmas"

    };


    const cursoKey = cursoMap[rawCurso];


    const domains = {

      "espiritos-miasmas": {
        paths: espiritosPaths,
        resolve: resolveEspiritos
      },

      dam: {
        paths: damPaths,
        resolve: resolveDam
      },

      "bio-humano": {
        paths: bioHumanoPaths,
        resolve: resolveBioHumano
      },

      "bio-animal": {
        paths: bioAnimalPaths,
        resolve: resolveBioAnimal
      }

    };


    const domain = domains[cursoKey];


    if (!domain) {

      console.error("Curso inválido recebido:", rawCurso);

      return res.status(400).json({
        success: false,
        erro: `Curso inválido: ${rawCurso}`
      });

    }


    let resultado = {};

    try {

      resultado = await aggregateData(
        dados,
        domain.paths,
        domain.resolve
      ) || {};

    } catch (err) {

      console.error("Erro no aggregateData:", err);

      return res.status(500).json({
        success: false,
        erro: "Erro ao processar os dados de rastreio",
        retry: true
      });

    }


    // 🔒 evita retorno vazio
    if (!resultado || Object.keys(resultado).length === 0) {

      console.error("Resultado vazio");

      return res.status(500).json({
        success: false,
        erro: "Nenhum conteúdo encontrado",
        retry: true
      });

    }


    // 🔥 tratamento especial DAM (mantras)
    if (cursoKey === "dam") {

      let mantraAtivacao = "";
      let mantraDesativacao = "";

      try {

        const [ativacao, desativacao] = await Promise.all([

          fetchFromGitHub("DAM/MANTRAS/MANTRA-ATIVACAO.txt"),
          fetchFromGitHub("DAM/MANTRAS/MANTRA-DESATIVACAO.txt")

        ]);

        mantraAtivacao = normalize(ativacao);
        mantraDesativacao = normalize(desativacao);

      } catch (err) {

        console.error("Erro ao buscar mantras:", err);

      }


      return res.status(200).json({

        success: true,
        curso: cursoKey,

        resultado,

        mantras: {
          ativacao: mantraAtivacao,
          desativacao: mantraDesativacao
        }

      });

    }


    // 📦 retorno padrão (BIO HUMANO, BIO ANIMAL, ESPÍRITOS)

    return res.status(200).json({

      success: true,
      curso: cursoKey,
      resultado

    });

  } catch (error) {

    console.error("Erro inesperado no rastreio:", error);

    return res.status(500).json({
      success: false,
      erro: "Erro interno do servidor",
      retry: true
    });

  }
}
