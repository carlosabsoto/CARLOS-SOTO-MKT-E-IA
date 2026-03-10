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
PARSER TEXTO DAM (ROBUSTO)
------------------------------------------------
*/

function parseRastreioDAM(texto = "") {

  const lower = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  function extrairTodosNumeros(regex) {

    const encontrados = [];
    let match;

    while ((match = regex.exec(lower)) !== null) {

      if (match[1]) {

        const nums = match[1].match(/\d+/g);

        if (nums) {

          nums.forEach(n => {

            const num = Number(n);

            if (!isNaN(num)) {
              encontrados.push(num);
            }

          });

        }

      }

    }

    return [...new Set(encontrados)];

  }

  return {

    cartas: extrairTodosNumeros(
      /(?:carta|campo)[^0-9]*([\d,\se]+)/g
    ),

    areasSistemicas: extrairTodosNumeros(
      /(?:area[s]?\s*sistemica[s]?|sistemica[s]?)[^0-9]*([\d,\se]+)/g
    ),

    areasDeAtuacao: extrairTodosNumeros(
      /(?:area[s]?\s*de\s*atuacao|atuacao)[^0-9]*([\d,\se]+)/g
    ),

    desativacoes: extrairTodosNumeros(
      /(?:desativac(?:ao|oes)|emoc(?:ao|oes)?\s*desativad(?:a|as)?)[^0-9]*([\d,\se]+)/g
    ),

    ativacoes: extrairTodosNumeros(
      /(?:ativac(?:ao|oes)|emoc(?:ao|oes)?\s*ativad(?:a|as)?)[^0-9]*([\d,\se]+)/g
    )

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

      if (req.query.texto) {
        body.texto = req.query.texto;
      }

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

    console.log("CURSO:", curso);
    console.log("DADOS:", dados);


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
    CARREGAR CONTEÚDO (FETCH PARALELO)
    ------------------------------------------------
    */

    async function carregar(categoria, numeros, resolver) {

      if (!numeros || !Array.isArray(numeros)) return;

      const tarefas = numeros.map(async (n) => {

        const path = resolver(n);
        if (!path) return;

        try {

          const conteudo = await fetchFromGitHub(path);
          if (!conteudo) return;

          if (!resultado[categoria]) resultado[categoria] = {};

          resultado[categoria][n] = conteudo;

        } catch (err) {

          console.log("Erro ao buscar:", path, err.message);

        }

      });

      await Promise.all(tarefas);

    }


    /*
    ------------------------------------------------
    EXECUÇÃO NORMAL
    ------------------------------------------------
    */

    const tarefasCategorias = [];

    for (const categoriaRecebida in dados) {

      const categoriaInterna = mapaCategorias[categoriaRecebida];
      if (!categoriaInterna) continue;

      const resolver = paths[categoriaInterna];

      if (typeof resolver === "function") {

        tarefasCategorias.push(
          carregar(
            categoriaInterna,
            dados[categoriaRecebida],
            resolver
          )
        );

      }

    }

    await Promise.all(tarefasCategorias);


    /*
    ------------------------------------------------
    MANTRAS (PARALELO)
    ------------------------------------------------
    */

    const [mantraAtivacao, mantraDesativacao] = await Promise.all([

      paths.mantraAtivacao
        ? fetchFromGitHub(paths.mantraAtivacao)
        : "",

      paths.mantraDesativacao
        ? fetchFromGitHub(paths.mantraDesativacao)
        : ""

    ]);


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
