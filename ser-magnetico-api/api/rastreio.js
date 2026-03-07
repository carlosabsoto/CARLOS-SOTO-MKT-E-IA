import damPaths from "../domains/dam/paths.js";
import espiritosPaths from "../domains/espiritos-miasmas/paths.js";
import bioHumanoPaths from "../domains/bio-humano/paths.js";
import bioAnimalPaths from "../domains/bio-animal/paths.js";

import { aggregateData } from "../services/aggregatorDAM.js";
import { aggregateEspiritos } from "../services/aggregatorEspiritos.js";
import { aggregateBioHumano } from "../services/aggregatorBioHumano.js";
import { aggregateBioAnimal } from "../services/aggregatorBioAnimal.js";

import { fetchFromGitHub } from "../services/githubService.js";


export default async function handler(req, res) {

  try {

    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });
    }

    const curso = req.body.curso || "dam";
    const dados = req.body.dados || req.body || {};

    let paths;
    let aggregator;
    let resultado = {};

    /*
    ------------------------------------------------
    SELEÇÃO DO CURSO
    ------------------------------------------------
    */

    switch (curso) {

      case "dam":

        paths = damPaths;
        aggregator = aggregateData;

        resultado = {
          cartas: {},
          areasSistemicas: {},
          areasDeAtuacao: {},
          desativacoes: {},
          ativacoes: {}
        };

        break;


      case "espiritos":

        paths = espiritosPaths;
        aggregator = aggregateEspiritos;

        resultado = {
          fechamentoPortais: {},
          cancelamentoPactos: {},
          liberacaoEspiritos: {},
          energiasDensas: {},
          associacaoEmocional: {},
          psiquismoMae: {},
          psiquismoPai: {},
          miasmas: {}
        };

        break;


      case "biohumano":

        paths = bioHumanoPaths;
        aggregator = aggregateBioHumano;

        resultado = {
          paresEmocionais: {},
          reservatorios: {},
          rastreioGeral: {},
          sistemas: {}
        };

        break;


      case "bioanimal":

        paths = bioAnimalPaths;
        aggregator = aggregateBioAnimal;

        resultado = {
          paresEmocionais: {},
          reservatorios: {},
          rastreioGeral: {},
          sistemas: {}
        };

        break;


      default:

        return res.status(400).json({
          success: false,
          erro: "Curso inválido"
        });

    }


    /*
    ------------------------------------------------
    CARREGAMENTO SEQUENCIAL (ESTÁVEL MOBILE)
    ------------------------------------------------
    */

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


    /*
    ------------------------------------------------
    EXECUÇÃO DINÂMICA
    ------------------------------------------------
    */

    for (const categoria in dados) {

      const resolver = paths[categoria];

      if (typeof resolver === "function") {

        await carregar(categoria, dados[categoria], resolver);

      }

    }


    /*
    ------------------------------------------------
    MANTRAS
    ------------------------------------------------
    */

    const mantraAtivacao = paths.mantraAtivacao
      ? await fetchFromGitHub(paths.mantraAtivacao)
      : "";

    const mantraDesativacao = paths.mantraDesativacao
      ? await fetchFromGitHub(paths.mantraDesativacao)
      : "";


    /*
    ------------------------------------------------
    AGREGAÇÃO
    ------------------------------------------------
    */

    const blocos = aggregator(resultado, mantraAtivacao, mantraDesativacao);

    const resultadoBlocos = Array.isArray(blocos) ? blocos : [blocos];


    /*
    ------------------------------------------------
    LOGS DE DIAGNÓSTICO
    ------------------------------------------------
    */

    console.log("CURSO:", curso);
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
