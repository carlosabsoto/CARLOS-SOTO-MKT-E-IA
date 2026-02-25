import espiritosPaths from "../domains/espiritos-miasmas/paths.js";
import { aggregateData } from "../services/aggregator.js";
import { validateRequest } from "../services/validator.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ erro: "Método não permitido" });
    }

    validateRequest(req.body);

    const { curso, dados } = req.body;

    if (curso !== "espiritos-miasmas") {
      return res.status(400).json({ erro: "Curso inválido" });
    }

    const resultado = await aggregateData(dados, espiritosPaths);

    return res.status(200).json({
      curso,
      resultado
    });
  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}
