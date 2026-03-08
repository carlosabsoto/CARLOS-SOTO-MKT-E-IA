import damPaths from "../domains/dam/paths.js";
import espiritosPaths from "../domains/espiritos-miasmas/paths.js";
import bioHumanoPaths from "../domains/bio-humano/paths.js";
import bioAnimalPaths from "../domains/bio-animal/paths.js";

import { aggregateDAM } from "../services/aggregatorDAM.js";
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

    const cursoRaw = req.body.curso || "dam";
    const dados = req.body.dados || req.body || {};

    const curso = cursoRaw.toLowerCase().replace(/[-_]/g, "");

    console.log("CURSO RECEBIDO:", cursoRaw);
    console.log("CURSO NORMALIZADO:", curso);
    console.log("DADOS RECEBIDOS:", JSON.stringify(dados, null, 2));

    let paths;
    let aggregator;
    let resultado = {};
    let mapaCategorias = {};

    switch (curso) {

      case "dam":

        paths = damPaths;
        aggregator = aggregateDAM;

        resultado = {
          cartas: {},
          areasSistemicas: {},
          areasDeAtuacao: {},
          desativacoes: {},
          ativacoes: {}
        };

        mapaCategorias = {
          cartas: "cartas",
          areasSistemicas: "areasSistemicas",
          areasDeAtuacao: "areasDeAtuacao",
          desativacoes: "desativacoes",
          ativacoes: "ativacoes"
        };

      break;



      case "espiritos":
      case "espiritosmiasmas":

        paths = espiritosPaths;
        aggregator = aggregateEspiritos;

        resultado = {
          fechamentoPortais: {},
          cancelamentoPactos: {},
          liberacaoEspiritos: {},
          energiasDensas: {},
          associacaoEmocional: {},
          miasmas: {},
          mantras: {}
        };

        mapaCategorias = {
          portais: "fechamentoPortais",
          pactos: "cancelamentoPactos",
          espiritos: "liberacaoEspiritos",
          energias: "energiasDensas",
          associacoes: "associacaoEmocional",
          miasmas: "miasmas",
          mantras: "mantras"
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

        mapaCategorias = {
          paresEmocionais: "paresEmocionais",
          reservatorios: "reservatorios",
          rastreioGeral: "rastreioGeral"
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

        mapaCategorias = {
          paresEmocionais: "paresEmocionais",
          reservatorios: "reservatorios",
          rastreioGeral: "rastreioGeral"
        };

      break;



      default:

        console.log("CURSO NÃO RECONHECIDO:", cursoRaw);

        return res.status(400).json({
          success: false,
          erro: "Curso inválido"
        });

    }



    /*
    ------------------------------------------------
    FUNÇÃO PADRÃO DE CARREGAMENTO
    ------------------------------------------------
    */

    async function carregar(categoria, numeros, resolver) {

      if (!numeros || !Array.isArray(numeros)) return;

      for (const n of numeros) {

        const path = resolver(n);

        if (!path) continue;

        try {

          const conteudo = await fetchFromGitHub(path);

          if (!conteudo) continue;

          if (!resultado[categoria]) resultado[categoria] = {};

          resultado[categoria][n] = conteudo;

          console.log("✔ CONTEÚDO SALVO:", categoria, n);

        } catch (err) {

          console.log("Erro ao buscar:", path, err.message);

        }

      }

    }



    /*
    ------------------------------------------------
    SISTEMAS + PARES (BIO HUMANO / BIO ANIMAL)
    ------------------------------------------------
    */

    if (curso === "biohumano" || curso === "bioanimal") {

      const sistemas = Array.isArray(dados.sistemas) ? dados.sistemas : [];
      const paresSistema = Array.isArray(dados.paresSistema) ? dados.paresSistema : [];

      const indice = {};

      for (const item of paresSistema) {

        const sistema = String(item?.sistema ?? "");
        const par = item?.par;

        if (!sistema || par == null) continue;

        if (!indice[sistema]) indice[sistema] = [];

        indice[sistema].push(par);

      }


      for (const sistema of sistemas) {

        try {

          const textoSistema = await fetchFromGitHub(
            paths.sistemas(sistema)
          );

          resultado.sistemas[String(sistema)] = {
            texto: textoSistema,
            pares: {}
          };

          console.log("✔ SISTEMA:", sistema);

        } catch (err) {

          console.log("Erro sistema:", sistema, err.message);

        }

      }


      for (const sistema of Object.keys(indice)) {

        if (!resultado.sistemas[sistema]) continue;

        for (const par of indice[sistema]) {

          try {

            const textoPar = await fetchFromGitHub(
              paths.paresSistema(sistema, par)
            );

            resultado.sistemas[sistema].pares[par] = textoPar;

            console.log("✔ PAR:", sistema, par);

          } catch (err) {

            console.log("Erro par:", sistema, par, err.message);

          }

        }

      }

    }



    /*
    ------------------------------------------------
    EXECUÇÃO NORMAL
    ------------------------------------------------
    */

    for (const categoriaRecebida in dados) {

      const categoriaInterna = mapaCategorias[categoriaRecebida];

      if (!categoriaInterna) continue;

      const resolver = paths[categoriaInterna];

      if (typeof resolver === "function") {

        await carregar(
          categoriaInterna,
          dados[categoriaRecebida],
          resolver
        );

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
    AGREGAÇÃO FINAL
    ------------------------------------------------
    */

    const blocos = aggregator(
      resultado,
      mantraAtivacao,
      mantraDesativacao
    );

    const resultadoBlocos = Array.isArray(blocos)
      ? blocos
      : [blocos];



    console.log("TOTAL BLOCOS:", resultadoBlocos.length);

    resultadoBlocos.forEach((b, i) => {
      console.log(`BLOCO ${i} TAMANHO:`, b.length);
    });



    const jsonResposta = {
      success: true,
      curso: cursoRaw,
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
