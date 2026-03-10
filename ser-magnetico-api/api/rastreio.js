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

  if (Array.isArray(valor)) return valor.map(Number);

  return String(valor)
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v));

}


/*
------------------------------------------------
PARSER TEXTO DAM
------------------------------------------------
*/

function parseRastreioDAM(texto = "") {

  const lower = texto.toLowerCase();

  function extrairNumeros(regex) {

    const match = lower.match(regex);

    if (!match) return [];

    return (match[1].match(/\d+/g) || []).map(n => Number(n));

  }

  return {

    cartas: extrairNumeros(/carta[^0-9]*([\d,\se]+)/),

    areasSistemicas: extrairNumeros(/area[s]?\s*sistemica[s]?[^0-9]*([\d,\se]+)/),

    areasDeAtuacao: extrairNumeros(/area[s]?\s*de\s*atuacao[^0-9]*([\d,\se]+)/),

    desativacoes: extrairNumeros(/desativac[aã]o(?:es)?[^0-9]*([\d,\se]+)/),

    ativacoes: extrairNumeros(/ativac[aã]o(?:es)?[^0-9]*([\d,\se]+)/)

  };

}


/*
------------------------------------------------
HANDLER
------------------------------------------------
*/

export default async function handler(req, res) {

  try {

    /*
    ------------------------------------------------
    SUPORTE GET + POST
    ------------------------------------------------
    */

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

    }

    else if (req.method === "POST") {

      body = req.body || {};

    }

    else {

      return res.status(405).json({
        success: false,
        erro: "Método não permitido"
      });

    }


    const cursoRaw = body.curso || "dam";


    /*
    ------------------------------------------------
    TEXTO LIVRE DAM
    ------------------------------------------------
    */

    let dados = body.dados || body || {};

    if (cursoRaw === "dam" && body.texto) {

      console.log("🔎 PARSING TEXTO DAM");

      dados = parseRastreioDAM(body.texto);

    }


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
          sistemas: {},
          protocolos: {}
        };

        mapaCategorias = {
          paresEmocionais: "paresEmocionais",
          reservatorios: "reservatorios",
          rastreioGeral: "rastreioGeral",
          protocolos: "protocolos"
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

        return res.status(400).json({
          success: false,
          erro: "Curso inválido"
        });

    }


    /*
    ------------------------------------------------
    CARREGAR CONTEÚDO
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


    return res.status(200).json({
      success: true,
      curso: cursoRaw,
      resultado: resultadoBlocos
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
