import damPaths from "../domains/dam/paths.js";
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

    // aceita body com ou sem "dados"
    const curso = req.body.curso || "dam";
    const dados = req.body.dados || req.body || {};

    const resultado = {
      cartas: {},
      areasSistemicas: {},
      areasDeAtuacao: {},
      desativacoes: {},
      ativacoes: {}
    };

    // leitura sequencial (mais estável para mobile)
    async function carregar(categoria, numeros, resolver) {

      if (!numeros || !Array.isArray(numeros)) return;

      for (const n of numeros) {

        const path = resolver(n);

        if (!path) {
          console.log("Path não encontrado:", categoria, n);
          continue;
        }

        try {

          const conteudo = await fetchFromGitHub(path);

          if (!conteudo) {
            console.log("Arquivo vazio:", path);
            continue;
          }

          resultado[categoria][n] = conteudo;

        } catch (err) {

          console.log("Erro ao buscar:", path, err.message);

        }

      }

    }

    await carregar("cartas", dados.cartas, damPaths.cartas);
    await carregar("areasSistemicas", dados.areasSistemicas, damPaths.areasSistemicas);
    await carregar("areasDeAtuacao", dados.areasDeAtuacao, damPaths.areasDeAtuacao);
    await carregar("desativacoes", dados.desativacoes, damPaths.desativacoes);
    await carregar("ativacoes", dados.ativacoes, damPaths.ativacoes);

    // mantras
    const mantraAtivacao = damPaths.mantraAtivacao
      ? await fetchFromGitHub(damPaths.mantraAtivacao)
      : "";

    const mantraDesativacao = damPaths.mantraDesativacao
      ? await fetchFromGitHub(damPaths.mantraDesativacao)
      : "";

    // agregação
    const blocos = aggregateData(resultado, mantraAtivacao, mantraDesativacao);

    const resultadoBlocos = Array.isArray(blocos) ? blocos : [blocos];

    // logs de diagnóstico
    console.log("TOTAL BLOCOS:", resultadoBlocos.length);

    resultadoBlocos.forEach((b, i) => {
      console.log(`BLOCO ${i} TAMANHO:`, b.length);
    });

    const jsonResposta = {
      success: true,
      curso,
      resultado: resultadoBlocos
    };

    console.log("TAMANHO JSON:", JSON.stringify(jsonResposta).length);

    return res.status(200).json(jsonResposta);

  } catch (erro) {

    console.error("Erro rastreio:", erro);

    return res.status(500).json({
      success: false,
      erro: "Erro interno",
      detalhes: erro.message
    });

  }

}
