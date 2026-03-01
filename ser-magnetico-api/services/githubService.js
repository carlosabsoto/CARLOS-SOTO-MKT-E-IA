const BASE_URL =
  "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/refs/heads/main/";

/**
 * Cache simples em memória
 * Evita múltiplas chamadas ao mesmo arquivo
 */
const cache = new Map();


export async function fetchFromGitHub(path) {

  if (!path) {
    throw new Error("Path inválido");
  }

  const normalizedPath = path.trim();

  // 🔹 CACHE HIT
  if (cache.has(normalizedPath)) {
    return cache.get(normalizedPath);
  }

  const url = BASE_URL + normalizedPath;

  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new Error(`Erro de conexão ao buscar ${normalizedPath}`);
  }

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${normalizedPath} (${response.status})`);
  }

  const text = await response.text();

  // 🔹 salva no cache
  cache.set(normalizedPath, text);

  return text;
}
