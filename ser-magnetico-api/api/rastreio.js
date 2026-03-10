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
PARSER TEXTO DAM (ACEITA NÚMEROS E POR EXTENSO)
------------------------------------------------
*/

function parseRastreioDAM(texto = "") {

  // Normaliza o texto
  const lower = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // Mapa completo de números por extenso
  const numerosExtenso = {
    'zero': 0, 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'tres': 3, 'três': 3,
    'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9,
    'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14, 'quinze': 15,
    'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19,
    'vinte': 20, 'vinte e um': 21, 'vinte e dois': 22, 'vinte e tres': 23,
    'vinte e quatro': 24, 'vinte e cinco': 25, 'vinte e seis': 26,
    'vinte e sete': 27, 'vinte e oito': 28, 'vinte e nove': 29,
    'trinta': 30, 'trinta e um': 31, 'trinta e dois': 32, 'trinta e tres': 33,
    'trinta e quatro': 34, 'trinta e cinco': 35, 'trinta e seis': 36,
    'quarenta': 40, 'cinquenta': 50, 'sessenta': 60, 'setenta': 70,
    'oitenta': 80, 'noventa': 90, 'cem': 100, 'cento': 100
  };

  // Converte números por extenso para dígitos
  let textoConvertido = lower;
  
  // Ordena do mais longo para o mais curto (para pegar "vinte e três" antes de "vinte")
  const chavesOrdenadas = Object.keys(numerosExtenso).sort((a, b) => b.length - a.length);
  
  for (const extenso of chavesOrdenadas) {
    const regex = new RegExp(`\\b${extenso}\\b`, 'g');
    textoConvertido = textoConvertido.replace(regex, ` ${numerosExtenso[extenso]} `);
  }

  console.log("🔄 TEXTO CONVERTIDO:", textoConvertido);

  // Função para extrair números de um padrão
  function extrairNumeros(regexPattern) {
    const match = textoConvertido.match(regexPattern);
    if (!match) return [];
    
    // Pega tudo depois do match até encontrar o próximo campo ou fim
    const textoAposMatch = match[0];
    const numeros = textoAposMatch.match(/\d+/g);
    
    if (!numeros) return [];
    
    return numeros.map(n => parseInt(n)).filter(n => !isNaN(n));
  }

  const resultado = {
    cartas: [],
    areasSistemicas: [],
    areasDeAtuacao: [],
    desativacoes: [],
    ativacoes: []
  };

  // Extrai cada campo
  resultado.cartas = extrairNumeros(/(?:carta|campo)[^a-z]*([\d\s,e]+)/i);
  resultado.areasSistemicas = extrairNumeros(/(?:area[s]?\s+sistemica[s]?|sistemica[s]?)[^a-z]*([\d\s,e]+)/i);
  resultado.areasDeAtuacao = extrairNumeros(/(?:area[s]?\s+de\s+atuacao|atuacao)[^a-z]*([\d\s,e]+)/i);
  resultado.desativacoes = extrairNumeros(/(?:desativar|desativac)[^a-z]*([\d\s,e]+)/i);
  resultado.ativacoes = extrairNumeros(/(?:ativar|ativac)[^a-z]*([\d\s,e]+)/i);

  // Pega apenas o primeiro número para campos únicos
  if (resultado.cartas.length > 0) {
    resultado.cartas = [resultado.cartas[0]];
  }
  if (resultado.areasSistemicas.length > 0) {
    resultado.areasSistemicas = [resultado.areasSistemicas[0]];
  }
  if (resultado.areasDeAtuacao.length > 0) {
    resultado.areasDeAtuacao = [resultado.areasDeAtuacao[0]];
  }

  console.log("✅ RESULTADO DO PARSE:", resultado);

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
