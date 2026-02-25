import espiritosPaths from "../domains/espiritos-miasmas/paths.js";
import damPaths from "../domains/dam/paths.js";

import { aggregateData } from "../services/aggregator.js";
import { validateRequest } from "../services/validator.js";
import { fetchFromGitHub } from "../services/githubService.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ erro: "Método não permitido" });
    }

    validateRequest(req.body);

    const { curso, dados } = req.body;

    // 🔹 DOMÍNIOS DINÂMICOS
    const domains = {
      "espiritos-miasmas": espiritosPaths,
      "dam": damPaths
    };

    if (!domains[curso]) {
      return res.status(400).json({ erro: "Curso inválido" });
    }

    // 🔥 CURSO DAM (tratamento especial)
    if (curso === "dam") {

      const resultado = await aggregateData(dados, damPaths);

      // Mantras fixos fora do agregador
      const mantraAtivacao = await fetchFromGitHub(
        "DAM/MANTRAS/MANTRA-ATIVACAO.txt"
      );

      const mantraDesativacao = await fetchFromGitHub(
        "DAM/MANTRAS/MANTRA-DESATIVACAO.txt"
      );

      return res.status(200).json({
        curso,
        mantraAtivacao,
        resultado,
        mantraDesativacao
      });
    }

    // 🔹 OUTROS CURSOS (padrão agregador)
    const resultado = await aggregateData(dados, domains[curso]);

    return res.status(200).json({
      curso,
      resultado
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      erro: error.message
    });
  }
}
