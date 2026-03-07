function dividirEmBlocos(texto="",tamanho=12000){

 const partes=[]
 let inicio=0

 while(inicio<texto.length){

  partes.push(texto.slice(inicio,inicio+tamanho))
  inicio+=tamanho

 }

 return partes

}



export function aggregateBioAnimal(resultado={}){

 let conteudo=""



 /*
 -------------------------
 PARES EMOCIONAIS
 -------------------------
 */

 const emocionais=Object.values(resultado.paresEmocionais||{})

 if(emocionais.length){

  conteudo+="Pares emocionais\n\n"

  emocionais.forEach(v=>{
   conteudo+=v+"\n"
  })

  conteudo+="\n"

 }



 /*
 -------------------------
 RESERVATÓRIOS
 -------------------------
 */

 const reservatorios=Object.values(resultado.reservatorios||{})

 if(reservatorios.length){

  conteudo+="Reservatórios\n\n"

  reservatorios.forEach(v=>{
   conteudo+=v+"\n"
  })

  conteudo+="\n"

 }



 /*
 -------------------------
 RASTREIO GERAL
 -------------------------
 */

 const geral=Object.values(resultado.rastreioGeral||{})

 if(geral.length){

  conteudo+="Rastreio geral\n\n"

  geral.forEach(v=>{
   conteudo+=v+"\n"
  })

  conteudo+="\n"

 }



 /*
 -------------------------
 SISTEMAS
 -------------------------
 */

 for(const sistema in resultado.sistemas){

  const dadosSistema=resultado.sistemas[sistema]

  if(!dadosSistema) continue

  conteudo+=dadosSistema.texto+"\n\n"

  const pares=dadosSistema.pares||{}

  Object.values(pares).forEach(par=>{

   conteudo+=par+"\n"

  })

  conteudo+="\n"

 }



 return dividirEmBlocos(conteudo)

}
