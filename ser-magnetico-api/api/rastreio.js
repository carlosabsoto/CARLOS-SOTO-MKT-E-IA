import espiritosPaths, { resolvePath as resolveEspiritos } from "../domains/espiritos-miasmas/paths.js";
import damPaths, { resolvePath as resolveDam } from "../domains/dam/paths.js";
import bioHumanoPaths, { resolvePath as resolveBioHumano } from "../domains/bio-humano/paths.js";
import bioAnimalPaths, { resolvePath as resolveBioAnimal } from "../domains/bio-animal/paths.js";

import { aggregateData } from "../services/aggregator.js";
import { validateRequest } from "../services/validator.js";
import { fetchFromGitHub } from "../services/githubService.js";

export default async function handler(req, res) {

  try {

    // 🔹 Permitir apenas POST
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });
    }

    // 🔹 Log completo para debug
    console.log("BODY RECEBIDO:", JSON.stringify(req.body, null, 2));

    // 🔹 Validação básica
    validateRequest(req.body);

    // 🔹 Extrair dados
    let { curso, dados } = req.body || {};

    if (!dados || Object.keys(dados).length === 0) {
    return res.status(400).json({
      success: false,
      erro: "Nenhum dado de rastreio informado"
    });
    }

    // 🔹 Curso padrão caso não venha no body
    curso = curso || "bio-animal";

    if (!dados) {
      return res.status(400).json({
        success: false,
        erro: "Campo 'dados' não informado"
      });
    }

    // 🔹 Normalização segura do curso
    const rawCurso = String(curso)
      .trim()
      .toLowerCase()
      .replaceAll("_", "-")
      .replaceAll(" ", "-");

    // 🔹 Mapeamento oficial de cursos
    const cursoMap = {
      "dam": "dam",
      "bio-humano": "bio-humano",
      "bio-animal": "bio-animal",
      "espiritos-miasmas": "espiritos-miasmas"
    };

    const cursoKey = cursoMap[rawCurso];

    // 🔹 Definição dos domínios
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

    // 🔹 Curso inválido
    if (!domain) {

      console.error("Curso recebido inválido:", rawCurso);

      return res.status(400).json({
        success: false,
        erro: `Curso inválido: ${rawCurso}`
      });

    }

    // 🔥 CURSO DAM (tratamento especial)
    if (cursoKey === "dam") {

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
        curso: cursoKey,
        resultado,
        mantras: {
          ativacao: mantraAtivacao,
          desativacao: mantraDesativacao
        }
      });

    }

    // 🔹 Processamento padrão (Bio Humano / Bio Animal / Espíritos)
    const resultado = await aggregateData(
      dados,
      domain.paths,
      domain.resolve
    ) || {};

    return res.status(200).json({
      success: true,
      curso: cursoKey,
      resultado
    });

  } catch (error) {

    console.error("Erro no rastreio:", error);

    return res.status(200).json({
      success: false,
      erro: "Falha ao acessar a base de dados",
      retry: true
    });

  }

}
