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

    const tarefas = [];

    function carregar(categoria, numeros, resolver) {

      if (!numeros || !Array.isArray(numeros)) return;

      for (const n of numeros) {

        const path = resolver(n);

        if (!path) {
          console.log("Path não encontrado:", categoria, n);
          continue;
        }

        const tarefa = fetchFromGitHub(path)
          .then(conteudo => {

            if (!conteudo) {
              console.log("Arquivo vazio:", path);
              return;
            }

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

    // consolida para evitar erro de transmissão do GPT
    const textoFinal = Array.isArray(blocos)
      ? blocos.join("\n\n")
      : blocos;

    return res.status(200).json({
      success: true,
      curso,
      resultado: blocos,   // blocos individuais
      texto: textoFinal,   // texto consolidado para exibição
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
