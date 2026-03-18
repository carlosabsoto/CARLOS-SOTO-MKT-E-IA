const BASE_URL = "https://ias-ser-magnetico.vercel.app/api/rastreio"; 
// ⚠️ em produção troque para:
// https://ias-ser-magnetico.vercel.app/api/rastreio

async function testar(nome, url) {

  try {

    const res = await fetch(url);
    const data = await res.json();

    const ok = res.status === 200 &&
               data.success === true &&
               Array.isArray(data.resultado) &&
               data.resultado.length > 0;

    console.log(`\n=== ${nome} ===`);

    if (ok) {
      console.log("✅ OK");
    } else {
      console.log("❌ FALHOU");
      console.log("Status:", res.status);
      console.log("Resposta:", JSON.stringify(data, null, 2));
    }

  } catch (erro) {

    console.log(`\n=== ${nome} ===`);
    console.log("❌ ERRO DE REDE");
    console.log(erro.message);

  }

}



async function run() {

  console.log("\n🚀 INICIANDO TESTES DO BACKEND\n");

  // ------------------------
  // DAM
  // ------------------------
  await testar(
    "DAM",
    `${BASE_URL}?curso=dam&texto=cartas:7 areasSistemicas:3 desativacoes:55,37 ativacoes:1,30`
  );

  // ------------------------
  // ESPÍRITOS
  // ------------------------
  await testar(
    "ESPÍRITOS",
    `${BASE_URL}?curso=espiritos&portais=1&pactos=2&espiritos=3`
  );

  // ------------------------
  // BIO HUMANO
  // ------------------------
  await testar(
    "BIO HUMANO",
    `${BASE_URL}?curso=biohumano&paresEmocionais=32&reservatorios=11`
  );

  // ------------------------
  // BIO ANIMAL
  // ------------------------
  await testar(
    "BIO ANIMAL",
    `${BASE_URL}?curso=bioanimal&paresEmocionais=32&reservatorios=11&sistemas=4`
  );

  console.log("\n🏁 TESTES FINALIZADOS\n");

}

run();
