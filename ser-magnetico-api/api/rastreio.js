import damPaths, { resolvePath as resolveDam } from "../domains/dam/paths.js";
import { aggregateData } from "../services/aggregator.js";
import { fetchFromGitHub } from "../services/githubService.js";

export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });
    }

    const { curso = "dam", dados } = req.body;

    if (!dados) {
      return res.status(400).json({
        success: false,
        erro: "Campo 'dados' é obrigatório"
      });
    }

    let resultado = {
      cartas: {},
      areasSistemicas: {},
      areasDeAtuacao: {},
      desativacoes: {},
      ativacoes: {}
    };

    async function carregar(categoria, numeros, resolver) {

      if (!numeros) return;

      for (const n of numeros) {

        const path = resolver(categoria, n);

        if (!path) continue;

        const conteudo = await fetchFromGitHub(path);

        if (!resultado[categoria]) resultado[categoria] = {};

        resultado[categoria][n] = conteudo;
      }
    }

    await carregar("cartas", dados.cartas, resolveDam);
    await carregar("areasSistemicas", dados.areasSistemicas, resolveDam);
    await carregar("areasDeAtuacao", dados.areasDeAtuacao, resolveDam);
    await carregar("desativacoes", dados.desativacoes, resolveDam);
    await carregar("ativacoes", dados.ativacoes, resolveDam);

    const mantraAtivacao = damPaths.mantraAtivacao
      ? await fetchFromGitHub(damPaths.mantraAtivacao)
      : "";

    const mantraDesativacao = damPaths.mantraDesativacao
      ? await fetchFromGitHub(damPaths.mantraDesativacao)
      : "";

    const blocos = aggregateData(resultado, mantraAtivacao, mantraDesativacao);

    return res.status(200).json({
      success: true,
      curso,
      resultado: blocos,
      mantras: {
        ativacao: mantraAtivacao,
        desativacao: mantraDesativacao
      }
    });

  } catch (erro) {

    return res.status(500).json({
      success: false,
      erro: "Erro interno",
      detalhes: erro.message
    });

  }
}
