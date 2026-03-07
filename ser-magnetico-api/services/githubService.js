const BASE_URL =
  "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/main/";

export async function fetchFromGitHub(path) {

  const url = BASE_URL + path;

  console.log("🔎 BUSCANDO:", url);

  const response = await fetch(url);

  console.log("📡 STATUS:", response.status);

  if (!response.ok) {
    console.log("❌ ERRO AO BUSCAR:", url);
    return "";
  }

  const buffer = await response.arrayBuffer();
  const texto = new TextDecoder("utf-8").decode(buffer);

  console.log("📄 TAMANHO:", texto.length);

  return texto;
}
