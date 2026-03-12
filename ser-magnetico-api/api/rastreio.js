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


/*
------------------------------------------------
REMOVER DUPLICADOS
------------------------------------------------
*/

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
PARSER TEXTO DAM
------------------------------------------------
*/

function parseRastreioDAM(texto = "") {

  const lower = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  const numerosExtenso = {
    zero:0, um:1, uma:1, dois:2, duas:2, tres:3,
    quatro:4, cinco:5, seis:6, sete:7, oito:8, nove:9,
    dez:10, onze:11, doze:12, treze:13, quatorze:14, quinze:15,
    dezesseis:16, dezessete:17, dezoito:18, dezenove:19,
    vinte:20, "vinte e um":21, "vinte e dois":22, "vinte e tres":23,
    "vinte e quatro":24, "vinte e cinco":25, "vinte e seis":26,
    "vinte e sete":27, "vinte e oito":28, "vinte e nove":29,
    trinta:30, "trinta e um":31, "trinta e dois":32, "trinta e tres":33,
    "trinta e quatro":34, "trinta e cinco":35
  };

  let textoConvertido = lower;

  const chavesOrdenadas = Object.keys(numerosExtenso).sort((a,b)=>b.length-a.length);

  for (const extenso of chavesOrdenadas) {

    const regex = new RegExp(`\\b${extenso}\\b`, "g");

    textoConvertido = textoConvertido.replace(regex, ` ${numerosExtenso[extenso]} `);

  }

  console.log("🔄 TEXTO CONVERTIDO:", textoConvertido);

  function extrairSecao(inicio, fim) {

    const regexInicio = new RegExp(inicio, "i");
    const regexFim = fim ? new RegExp(fim, "i") : null;

    const matchInicio = textoConvertido.match(regexInicio);
    if (!matchInicio) return [];

    const posInicio = matchInicio.index + matchInicio[0].length;

    let posFim = textoConvertido.length;

    if (regexFim) {

      const matchFim = textoConvertido.slice(posInicio).match(regexFim);

      if (matchFim) posFim = posInicio + matchFim.index;

    }

    const secao = textoConvertido.slice(posInicio, posFim);

    const numeros = secao.match(/\d+/g);

    if (!numeros) return [];

    return [...new Set(numeros.map(n=>parseInt(n)).filter(n=>!isNaN(n)))];

  }

  const resultado = {
    cartas: [],
    areasSistemicas: [],
    areasDeAtuacao: [],
    desativacoes: [],
    ativacoes: []
  };

  resultado.cartas = extrairSecao(
    "carta[s]?\\s+da\\s+consciencia|carta[s]?\\s*:",
    "area[s]?\\s+sistemica"
  );

  resultado.areasSistemicas = extrairSecao(
    "area[s]?\\s+sistemica",
    "area[s]?\\s+de\\s+atuacao|atuacao"
  );

  resultado.areasDeAtuacao = extrairSecao(
    "area[s]?\\s+de\\s+atuacao|atuacao",
    "desativar|desativac"
  );

  resultado.desativacoes = extrairSecao(
    "desativar|desativac",
    "ativar|ativac"
  );

  resultado.ativacoes = extrairSecao(
    "ativar|ativac",
    null
  );

  if (resultado.cartas.length > 0) resultado.cartas = [resultado.cartas[0]];
  if (resultado.areasSistemicas.length > 0) resultado.areasSistemicas = [resultado.areasSistemicas[0]];
  if (resultado.areasDeAtuacao.length > 0) resultado.areasDeAtuacao = [resultado.areasDeAtuacao[0]];

  console.log("✅ RESULTADO DO PARSE:", resultado);

  return limparDuplicados(resultado);

}


/*
------------------------------------------------
HANDLER
------------------------------------------------
*/

export default async function handler(req,res){

try{

let body={};

/*
---------------------------------------------
SUPORTE GET + POST
---------------------------------------------
*/

if(req.method==="GET"){

body={
curso:req.query.curso,
dados:{
cartas:parseLista(req.query.cartas),
areasSistemicas:parseLista(req.query.areasSistemicas),
areasDeAtuacao:parseLista(req.query.areasDeAtuacao),
desativacoes:parseLista(req.query.desativacoes),
ativacoes:parseLista(req.query.ativacoes)
}
};

if(req.query.texto) body.texto=req.query.texto;

}

else if(req.method==="POST"){

body=req.body||{};

}

else{

return res.status(405).json({
success:false,
erro:"Método não permitido"
});

}

const cursoRaw=body.curso||"dam";
let dados=body.dados||body||{};

/*
---------------------------------------------
TEXTO LIVRE DAM
---------------------------------------------
*/

if(cursoRaw==="dam"&&body.texto){

console.log("🔎 PARSING TEXTO DAM");
console.log("📝 TEXTO RECEBIDO:",body.texto);

dados=parseRastreioDAM(body.texto);

}

dados=limparDuplicados(dados);

const curso=cursoRaw.toLowerCase().replace(/[-_]/g,"");

console.log("CURSO:",curso);
console.log("DADOS:",dados);

let paths;
let aggregator;
let resultado={};
let mapaCategorias={};

switch(curso){

case"dam":

paths=damPaths;
aggregator=aggregateDAM;

resultado={
cartas:{},
areasSistemicas:{},
areasDeAtuacao:{},
desativacoes:{},
ativacoes:{}
};

mapaCategorias={
cartas:"cartas",
areasSistemicas:"areasSistemicas",
areasDeAtuacao:"areasDeAtuacao",
desativacoes:"desativacoes",
ativacoes:"ativacoes"
};

break;

case"espiritos":
case"espiritosmiasmas":

paths=espiritosPaths;
aggregator=aggregateEspiritos;

resultado={
fechamentoPortais:{},
cancelamentoPactos:{},
liberacaoEspiritos:{},
energiasDensas:{},
associacaoEmocional:{},
miasmas:{},
mantras:{}
};

mapaCategorias={
portais:"fechamentoPortais",
pactos:"cancelamentoPactos",
espiritos:"liberacaoEspiritos",
energias:"energiasDensas",
associacoes:"associacaoEmocional",
miasmas:"miasmas",
mantras:"mantras"
};

break;

case"biohumano":

paths=bioHumanoPaths;
aggregator=aggregateBioHumano;

resultado={
paresEmocionais:{},
reservatorios:{},
rastreioGeral:{},
protocolos:{},
sistemas:{}
};

mapaCategorias={
paresEmocionais:"paresEmocionais",
reservatorios:"reservatorios",
rastreioGeral:"rastreioGeral",
protocolos:"protocolos"
};

break;

case"bioanimal":

paths=bioAnimalPaths;
aggregator=aggregateBioAnimal;

resultado={
paresEmocionais:{},
reservatorios:{},
rastreioGeral:{},
sistemas:{}
};

mapaCategorias={
paresEmocionais:"paresEmocionais",
reservatorios:"reservatorios",
rastreioGeral:"rastreioGeral"
};

break;

default:

return res.status(400).json({
success:false,
erro:"Curso inválido"
});

}

/*
---------------------------------------------
FETCH PARALELO
---------------------------------------------
*/

async function carregar(categoria,numeros,resolver){

if(!numeros||!Array.isArray(numeros))return;

const tarefas=[...new Set(numeros)].map(async n=>{

const path=resolver(n);
if(!path)return;

try{

const conteudo=await fetchFromGitHub(path);

if(!resultado[categoria])resultado[categoria]={};

resultado[categoria][n]=conteudo;

}catch{

console.log("Erro ao buscar:",path);

}

});

await Promise.all(tarefas);

}

/*
---------------------------------------------
EXECUÇÃO
---------------------------------------------
*/

const tarefas=[];

for(const categoriaRecebida in dados){

const categoriaInterna=mapaCategorias[categoriaRecebida];
if(!categoriaInterna)continue;

const resolver=paths[categoriaInterna];

if(typeof resolver==="function"){

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
MANTRAS
---------------------------------------------
*/

const [mantraAtivacao,mantraDesativacao]=await Promise.all([

paths.mantraAtivacao
?fetchFromGitHub(paths.mantraAtivacao)
:"",

paths.mantraDesativacao
?fetchFromGitHub(paths.mantraDesativacao)
:""

]);

/*
---------------------------------------------
AGREGAÇÃO
---------------------------------------------
*/

const blocos=aggregator(
resultado,
mantraAtivacao,
mantraDesativacao
);

const resultadoBlocos=Array.isArray(blocos)
?blocos
:[blocos];

return res.status(200).json({
success:true,
curso:cursoRaw,
resultado:resultadoBlocos
});

}

catch(erro){

console.error("Erro rastreio:",erro);

return res.status(500).json({
success:false,
erro:"Erro interno",
detalhes:erro.message
});

}

}
