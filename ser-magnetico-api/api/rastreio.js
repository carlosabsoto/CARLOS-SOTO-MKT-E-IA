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
    return [...new Set(valor.map(Number).filter(v => !isNaN(v)))];
  }

  return [
    ...new Set(
      String(valor)
        .split(",")
        .map(v => Number(v.trim()))
        .filter(v => !isNaN(v))
    )
  ];
}

function limparDuplicados(dados = {}) {
  for (const chave in dados) {
    if (Array.isArray(dados[chave])) {
      dados[chave] = [...new Set(dados[chave])];
    }
  }

  return dados;
}

function normalizarCurso(cursoRaw = "") {
  return String(cursoRaw || "dam")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_\s]/g, "");
}

function cursoResposta(cursoNormalizado, cursoRaw) {
  if (cursoNormalizado === "bioanimal") return "bio-animal";
  if (cursoNormalizado === "biohumano") return "bio-humano";
  if (cursoNormalizado === "espiritos" || cursoNormalizado === "espiritosmiasmas") {
    return "espiritos-miasmas";
  }

  return cursoRaw || "dam";
}

/*
------------------------------------------------
PARSER DAM
------------------------------------------------
*/

function parseRastreioDAM(texto = "") {
  const lower = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  function extrairNumerosCampo(campo) {
    const regex = new RegExp(
      `(?:^|\\s)${campo}\\s*:\\s*([0-9,\\s]+)(?=\\s+[a-zA-Z]+\\s*:|$)`,
      "i"
    );

    const match = lower.match(regex);

    if (!match) return [];

    return [
      ...new Set(
        match[1]
          .split(",")
          .map(n => Number(n.trim()))
          .filter(n => !isNaN(n))
      )
    ];
  }

  return {
    cartas: extrairNumerosCampo("cartas?"),
    areasSistemicas: extrairNumerosCampo("areas?sistemicas?"),
    areasDeAtuacao: extrairNumerosCampo("areas?deatuacao"),
    desativacoes: extrairNumerosCampo("desativacoes"),
    ativacoes: extrairNumerosCampo("ativacoes")
  };
}

/*
------------------------------------------------
HANDLER
------------------------------------------------
*/

export default async function handler(req, res) {
  let cursoRaw = "dam";

  try {
    let body = {};

    /*
    ---------------------------------------------
    GET / POST
    ---------------------------------------------
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

      if (req.query.texto) body.texto = req.query.texto;
    } else if (req.method === "POST") {
      body = req.body || {};
    } else {
      return res.status(405).json({
        success: false,
        curso: null,
        resultado: [],
        erro: "Método não permitido",
        retry: false
      });
    }

    cursoRaw = body.curso || "dam";
    let dados = body.dados || body || {};

    /*
    ---------------------------------------------
    NORMALIZAÇÃO DO CURSO
    ---------------------------------------------
    */

    const curso = normalizarCurso(cursoRaw);

    /*
    ---------------------------------------------
    PARSER TEXTO DAM
    ---------------------------------------------
    */

    if (curso === "dam" && body.texto) {
      console.log("🔎 PARSING TEXTO DAM");
      console.log("📝 TEXTO RECEBIDO:", body.texto);

      dados = parseRastreioDAM(body.texto);
    }

    dados = limparDuplicados(dados);

    console.log("CURSO:", curso);
    console.log("DADOS:", dados);

    let paths;
    let aggregator;
    let resultado = {};
    let mapaCategorias = {};

    /*
    ---------------------------------------------
    SWITCH DE CURSOS
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

      default:
        return res.status(400).json({
          success: false,
          curso: cursoRaw,
          resultado: [],
          erro: "Curso inválido",
          retry: false
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
        } catch (erro) {
          console.log("Erro ao buscar:", path, erro.message);
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
    AJUSTE SISTEMAS — BIO HUMANO + BIO ANIMAL
    ---------------------------------------------
    */

    if (curso === "bioanimal" || curso === "biohumano") {
      for (const sistema in resultado.sistemas) {
        const texto = resultado.sistemas[sistema];

        resultado.sistemas[sistema] = {
          texto,
          pares: {}
        };
      }

      if (Array.isArray(dados.paresSistema) && dados.paresSistema.length) {
        const tarefasPares = dados.paresSistema.map(async ({ sistema, par }) => {
          if (!sistema || !par) return;

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
          } catch (erro) {
            console.log("Erro ao buscar par sistema:", path, erro.message);
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

    const resultadoFinal = Array.isArray(blocos)
      ? blocos.filter(b => typeof b === "string" && b.trim())
      : [];

    console.log("✅ RESPOSTA FINAL:", {
      success: resultadoFinal.length > 0,
      cursoOriginal: cursoRaw,
      cursoNormalizado: curso,
      cursoResposta: cursoResposta(curso, cursoRaw),
      totalBlocos: resultadoFinal.length,
      tamanhoPrimeiroBloco: resultadoFinal[0]?.length || 0
    });

    if (!resultadoFinal.length) {
      return res.status(200).json({
        success: false,
        curso: cursoResposta(curso, cursoRaw),
        resultado: [],
        erro: "Nenhum conteúdo foi montado pelo aggregator.",
        retry: true
      });
    }

    return res.status(200).json({
      success: true,
      curso: cursoResposta(curso, cursoRaw),
      resultado: resultadoFinal,
      erro: null,
      retry: false
    });

  } catch (erro) {
    console.error("Erro rastreio:", erro);

    return res.status(500).json({
      success: false,
      curso: cursoRaw || null,
      resultado: [],
      erro: "Erro interno",
      detalhes: erro.message,
      retry: true
    });
  }
}
