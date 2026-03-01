const BASE_URL =
  "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/refs/heads/main/";

const cache = new Map();

export async function fetchFromGitHub(path) {

  const normalizedPath = path.trim();

  if (cache.has(normalizedPath)) {
    return cache.get(normalizedPath);
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 9500);

  try {

    const response = await fetch(BASE_URL + normalizedPath, {
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Erro ao buscar ${normalizedPath}`);
    }

    const text = await response.text();

    cache.set(normalizedPath, text);

    return text;

  } catch (error) {

    return `ERRO ao carregar ${normalizedPath}`;

  }

}
