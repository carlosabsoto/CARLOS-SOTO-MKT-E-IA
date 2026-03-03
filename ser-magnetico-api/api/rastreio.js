import espiritosPaths, { resolvePath as resolveEspiritos } from "../domains/espiritos-miasmas/paths.js";
import damPaths, { resolvePath as resolveDam } from "../domains/dam/paths.js";
import bioHumanoPaths, { resolvePath as resolveBioHumano } from "../domains/bio-humano/paths.js";
import bioAnimalPaths from "../domains/bio-animal/paths.js";

import { aggregateData } from "../services/aggregator.js";
import { validateRequest } from "../services/validator.js";
import { fetchFromGitHub } from "../services/githubService.js";

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });
    }

    validateRequest(req.body);

    const { curso, dados } = req.body;

    // 🔹 DOMÍNIOS DINÂMICOS
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
      }
    };

    const domain = domains[curso];

    if (!domain) {
      return res.status(400).json({
        success: false,
        erro: "Curso inválido"
      });
    }

    // 🔥 CURSO DAM (tratamento especial)
    if (curso === "dam") {

      const resultado = await aggregateData(
        dados,
        domain.paths,
        domain.resolve
      ) || {};

      const mantraAtivacao = await fetchFromGitHub(
        "DAM/MANTRAS/MANTRA-ATIVACAO.txt"
      );

      const mantraDesativacao = await fetchFromGitHub(
        "DAM/MANTRAS/MANTRA-DESATIVACAO.txt"
      );

      return res.status(200).json({
        success: true,
        curso,
        resultado,
        mantras: {
          ativacao: mantraAtivacao,
          desativacao: mantraDesativacao
        }
      });
    }

    // 🔹 OUTROS CURSOS
    const resultado = await aggregateData(
      dados,
      domain.paths,
      domain.resolve
    ) || {};

    return res.status(200).json({
      success: true,
      curso,
      resultado
    });

  }
  catch (error) {

  console.error(error);

  return res.status(200).json({
    success: false,
    erro: "Falha ao acessar a base de dados",
    retry: true
  });

}

  }

}
