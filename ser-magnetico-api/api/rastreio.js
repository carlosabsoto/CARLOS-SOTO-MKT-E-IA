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

  const lower = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " "); // Remove espaços extras

  const resultado = {
    cartas: [],
    areasSistemicas: [],
    areasDeAtuacao: [],
    desativacoes: [],
    ativacoes: []
  };

  // Função auxiliar para extrair números de qualquer parte do texto
  function extrairNumeros(regex) {
    const match = lower.match(regex);
    if (!match || !match[1]) return [];
    
    return match[1]
      .match(/\d+/g)
      ?.map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n)) || [];
  }

  // Tenta vários padrões para cada campo

  // CARTAS
  resultado.cartas = 
    extrairNumeros(/cartas?[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/carta[s]?\s+da\s+consciencia[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/campo[:\s]+([0-9,\s]+)/i) ||
    [];

  // ÁREAS SISTÊMICAS  
  resultado.areasSistemicas = 
    extrairNumeros(/areassistemicas?[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/area[s]?\s+sistemica[s]?[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/sistemica[s]?[:\s]+([0-9,\s]+)/i) ||
    [];

  // ÁREAS DE ATUAÇÃO
  resultado.areasDeAtuacao = 
    extrairNumeros(/areasdeatuacao[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/area[s]?\s+de\s+atuacao[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/atuacao[:\s]+([0-9,\s]+)/i) ||
    [];

  // DESATIVAÇÕES
  resultado.desativacoes = 
    extrairNumeros(/desativaco?es?[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/emoco?es?\s+(?:de\s+)?desativaca?o[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/desativar[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/emoco?es?\s+para\s+desativar[:\s]+([0-9,\s]+)/i) ||
    [];

  // ATIVAÇÕES
  resultado.ativacoes = 
    extrairNumeros(/ativaco?es?[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/emoco?es?\s+(?:de\s+)?ativaca?o[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/ativar[:\s]+([0-9,\s]+)/i) ||
    extrairNumeros(/emoco?es?\s+para\s+ativar[:\s]+([0-9,\s]+)/i) ||
    [];

  return resultado;
}


/*
------------------------------------------------
HANDLER
------------------------------------------------
*/

export default async function handler(req, res) {

  try {

    let body = {};

    /*
    ------------------------------------------------
    SUPORTE GET + POST
    ------------------------------------------------
    */

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
    let dados = body.dados || body || {};


    /*
    ------------------------------------------------
    TEXTO LIVRE DAM
    ------------------------------------------------
    */

    if (cursoRaw === "dam" && body.texto) {

      console.log("🔎 PARSING TEXTO DAM");
      console.log("📝 TEXTO RECEBIDO:", body.texto); 

      dados = parseRastreioDAM(body.texto);

    }


    const curso = cursoRaw.toLowerCase().replace(/[-_]/g, "");

    console.log("CURSO:", curso);
    console.log("DADOS:", dados);


    let paths;
    let aggregator;
    let resultado = {};
    let mapaCategorias = {};


    /*
    ------------------------------------------------
    CONFIGURAÇÃO POR CURSO
    ------------------------------------------------
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
    FUNÇÃO DE FETCH PARALELO
    ------------------------------------------------
    */

    async function carregar(categoria, numeros, resolver) {

      if (!numeros || !Array.isArray(numeros)) return;

      const tarefas = numeros.map(async (n) => {

        const path = resolver(n);
        if (!path) return;

        try {

          const conteudo = await fetchFromGitHub(path);

          if (!resultado[categoria]) resultado[categoria] = {};

          resultado[categoria][n] = conteudo;

        } catch (err) {

          console.log("Erro ao buscar:", path);

        }

      });

      await Promise.all(tarefas);

    }


    /*
    ------------------------------------------------
    EXECUÇÃO CATEGORIAS NORMAIS
    ------------------------------------------------
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
    ------------------------------------------------
    SISTEMAS
    ------------------------------------------------
    */

    if ((curso === "biohumano" || curso === "bioanimal") && dados.sistemas) {

      const tarefasSistema = dados.sistemas.map(async (s) => {

        try {

          const pathSistema = paths.sistemas(s);

          console.log("🔎 BUSCANDO:", pathSistema);

          const textoSistema = await fetchFromGitHub(pathSistema);

          resultado.sistemas[s] = {
            texto: textoSistema,
            pares: {}
          };

        } catch {

          console.log("Erro sistema:", s);

        }

      });

      await Promise.all(tarefasSistema);

    }


    /*
    ------------------------------------------------
    PARES DOS SISTEMAS
    ------------------------------------------------
    */

    if ((curso === "biohumano" || curso === "bioanimal") && dados.paresSistema) {

      const tarefasPares = dados.paresSistema.map(async ({ sistema, par }) => {

        try {

          const pathPar = paths.paresSistema(sistema, par);

          console.log("🔎 BUSCANDO:", pathPar);

          const textoPar = await fetchFromGitHub(pathPar);

          if (!resultado.sistemas[sistema]) {

            resultado.sistemas[sistema] = {
              texto: "",
              pares: {}
            };

          }

          resultado.sistemas[sistema].pares[par] = textoPar;

        } catch {

          console.log("Erro par:", sistema, par);

        }

      });

      await Promise.all(tarefasPares);

    }


    /*
    ------------------------------------------------
    MANTRAS
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

  }

  catch (erro) {

    console.error("Erro rastreio:", erro);

    return res.status(500).json({
      success: false,
      erro: "Erro interno",
      detalhes: erro.message
    });

  }

}
