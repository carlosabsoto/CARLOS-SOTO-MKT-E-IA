import espiritosPaths, { resolvePath as resolveEspiritos } from "../domains/espiritos-miasmas/paths.js";
import damPaths, { resolvePath as resolveDam } from "../domains/dam/paths.js";
import bioHumanoPaths, { resolvePath as resolveBioHumano } from "../domains/bio-humano/paths.js";
import bioAnimalPaths, { resolvePath as resolveBioAnimal } from "../domains/bio-animal/paths.js";

import { aggregateData } from "../services/aggregator.js";
import { fetchFromGitHub } from "../services/githubService.js";


const MAX_RESPONSE_SIZE = 120000;


function normalize(text = "") {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}


function limitar(texto) {
  if (texto.length > MAX_RESPONSE_SIZE) {
    return texto.slice(0, MAX_RESPONSE_SIZE);
  }
  return texto;
}


function consolidarConteudo(resultado, mantraAtivacao, mantraDesativacao) {

  let conteudo = "";

  if (mantraAtivacao) {
    conteudo += normalize(mantraAtivacao) + "\n\n";
  }

  for (const grupo in resultado) {
    for (const numero in resultado[grupo]) {

      const texto = resultado[grupo][numero];

      if (!texto) continue;

      conteudo += normalize(texto) + "\n\n";
    }
  }

  if (mantraDesativacao) {
    conteudo += normalize(mantraDesativacao);
  }

  return limitar(conteudo);
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

    curso = curso || "bio-animal";

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


    const rawCurso = String(curso || "")
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

      "dam": {
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


    // 🔥 tratamento especial DAM
    if (cursoKey === "dam") {

      const resultado = await aggregateData(
        dados,
        domain.paths,
        domain.resolve
      ) || {};

      let mantraAtivacao = "";
      let mantraDesativacao = "";

      try {

        mantraAtivacao = await fetchFromGitHub(
          "DAM/MANTRAS/MANTRA-ATIVACAO.txt"
        );

        mantraDesativacao = await fetchFromGitHub(
          "DAM/MANTRAS/MANTRA-DESATIVACAO.txt"
        );

      } catch (err) {

        console.error("Erro ao buscar mantras:", err);

      }


      const conteudo = consolidarConteudo(
        resultado,
        mantraAtivacao,
        mantraDesativacao
      );


      return res.status(200).json({
        success: true,
        curso: cursoKey,
        conteudo
      });

    }


    // execução padrão para outros cursos

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
