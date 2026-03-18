import damPaths from "../domains/dam/paths.js";
import espiritosPaths from "../domains/espiritos-miasmas/paths.js";
import bioHumanoPaths from "../domains/bio-humano/paths.js";
import bioAnimalPaths from "../domains/bio-animal/paths.js";

import { aggregateDAM } from "../services/aggregatorDAM.js";
import { aggregateEspiritos } from "../services/aggregatorEspiritos.js";
import { aggregateBioHumano } from "../services/aggregatorBioHumano.js";
import { aggregateBioAnimal } from "../services/aggregatorBioAnimal.js";

import { fetchFromGitHub } from "../services/githubService.js";

/*
------------------------------------------------
UTILS
------------------------------------------------
*/

function parseLista(valor) {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return [...new Set(valor.map(Number))];
  }

  return [...new Set(
    String(valor)
      .split(",")
      .map(v => Number(v.trim()))
      .filter(v => !isNaN(v))
  )];
}

function limparDuplicados(dados = {}) {
  for (const chave in dados) {
    if (Array.isArray(dados[chave])) {
      dados[chave] = [...new Set(dados[chave])];
    }
  }
  return dados;
}

/*
------------------------------------------------
HANDLER
------------------------------------------------
*/

export default async function handler(req, res) {

  try {

    let body = {};

    if (req.method === "GET") {

      body = {
        curso: req.query.curso,
        dados: {
          cartas: parseLista(req.query.cartas),
          areasSistemicas: parseLista(req.query.areasSistemicas),
          areasDeAtuacao: parseLista(req.query.areasDeAtuacao),
          desativacoes: parseLista(req.query.desativacoes),
          ativacoes: parseLista(req.query.ativacoes)
        }
      };

      if (req.query.texto) body.texto = req.query.texto;

    } else if (req.method === "POST") {

      body = req.body || {};

    } else {

      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });

    }

    const cursoRaw = body.curso || "dam";
    let dados = body.dados || body || {};

    dados = limparDuplicados(dados);

    const curso = cursoRaw.toLowerCase().replace(/[-_]/g, "");

    console.log("CURSO:", curso);
    console.log("DADOS:", dados);

    let paths;
    let aggregator;
    let resultado = {};
    let mapaCategorias = {};

    /*
    ---------------------------------------------
    SWITCH DE CURSOS (CORRIGIDO)
    ---------------------------------------------
    */

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
          protocolos: {},
          sistemas: {}
        };

        mapaCategorias = {
          paresEmocionais: "paresEmocionais",
          reservatorios: "reservatorios",
          rastreioGeral: "rastreioGeral",
          protocolos: "protocolos",
          sistemas: "sistemas"
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
          rastreioGeral: "rastreioGeral",
          sistemas: "sistemas"
        };

      break;



      default:

        return res.status(400).json({
          success: false,
          erro: "Curso inválido"
        });

    }

    /*
    ---------------------------------------------
    FETCH PADRÃO
    ---------------------------------------------
    */

    async function carregar(categoria, numeros, resolver) {

      if (!numeros || !Array.isArray(numeros)) return;

      const tarefas = [...new Set(numeros)].map(async n => {

        const path = resolver(n);
        if (!path) return;

        console.log("🔎 BUSCANDO:", path);

        try {

          const conteudo = await fetchFromGitHub(path);

          if (!resultado[categoria]) resultado[categoria] = {};

          resultado[categoria][n] = conteudo;

        } catch {

          console.log("Erro ao buscar:", path);

        }

      });

      await Promise.all(tarefas);
    }

    /*
    ---------------------------------------------
    EXECUÇÃO PADRÃO
    ---------------------------------------------
    */

    const tarefas = [];

    for (const categoriaRecebida in dados) {

      const categoriaInterna = mapaCategorias[categoriaRecebida];
      if (!categoriaInterna) continue;

      const resolver = paths[categoriaInterna];

      if (typeof resolver === "function") {

        tarefas.push(
          carregar(
            categoriaInterna,
            dados[categoriaRecebida],
            resolver
          )
        );

      }

    }

    await Promise.all(tarefas);

    /*
    ---------------------------------------------
    AJUSTE ESPECIAL BIO ANIMAL
    ---------------------------------------------
    */

    if (curso === "bioanimal") {

      // converter sistemas para estrutura correta
      for (const sistema in resultado.sistemas) {

        const texto = resultado.sistemas[sistema];

        resultado.sistemas[sistema] = {
          texto,
          pares: {}
        };

      }

      // carregar pares de sistema
      if (dados.paresSistema?.length) {

        const tarefasPares = dados.paresSistema.map(async ({ sistema, par }) => {

          const path = paths.paresSistema(sistema, par);

          console.log("🔎 BUSCANDO:", path);

          try {

            const conteudo = await fetchFromGitHub(path);

            if (!resultado.sistemas[sistema]) {
              resultado.sistemas[sistema] = {
                texto: "",
                pares: {}
              };
            }

            resultado.sistemas[sistema].pares[par] = conteudo;

          } catch {

            console.log("Erro ao buscar par sistema:", path);

          }

        });

        await Promise.all(tarefasPares);

      }

    }

    /*
    ---------------------------------------------
    AGGREGAÇÃO
    ---------------------------------------------
    */

    const blocos = aggregator(resultado);

    return res.status(200).json({
      success: true,
      curso: cursoRaw,
      resultado: Array.isArray(blocos) ? blocos : [blocos]
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
