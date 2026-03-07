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
    const dados = req.body.dados || req.body;

    const resultado = {
      cartas: {},
      areasSistemicas: {},
      areasDeAtuacao: {},
      desativacoes: {},
      ativacoes: {}
    };

    const tarefas = [];

    function carregar(categoria, numeros, resolver) {

      if (!numeros) return;

      for (const n of numeros) {

        const path = resolver(n);

        if (!path) continue;

        const tarefa = fetchFromGitHub(path)
          .then(conteudo => {
            resultado[categoria][n] = conteudo;
          })
          .catch(err => {
            console.log("Erro ao buscar:", path, err.message);
          });

        tarefas.push(tarefa);
      }
    }

    carregar("cartas", dados.cartas, damPaths.cartas);
    carregar("areasSistemicas", dados.areasSistemicas, damPaths.areasSistemicas);
    carregar("areasDeAtuacao", dados.areasDeAtuacao, damPaths.areasDeAtuacao);
    carregar("desativacoes", dados.desativacoes, damPaths.desativacoes);
    carregar("ativacoes", dados.ativacoes, damPaths.ativacoes);

    await Promise.all(tarefas);

    const [mantraAtivacao, mantraDesativacao] = await Promise.all([
      damPaths.mantraAtivacao
        ? fetchFromGitHub(damPaths.mantraAtivacao)
        : "",
      damPaths.mantraDesativacao
        ? fetchFromGitHub(damPaths.mantraDesativacao)
        : ""
    ]);

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

    console.error("Erro rastreio:", erro);

    return res.status(500).json({
      success: false,
      erro: "Erro interno",
      detalhes: erro.message
    });

  }

}
