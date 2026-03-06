const BASE_URL =
  "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/refs/heads/main/";

const cache = new Map();
const pendingRequests = new Map();

export async function fetchFromGitHub(path) {

  if (!path || typeof path !== "string") {
    console.warn("Path inválido recebido:", path);
    return "";
  }

  const normalizedPath = path.trim().replace(/^\/+/, "");

  // 🔹 cache de conteúdo já baixado
  if (cache.has(normalizedPath)) {
    return cache.get(normalizedPath);
  }

  // 🔹 evita múltiplos downloads simultâneos do mesmo arquivo
  if (pendingRequests.has(normalizedPath)) {
    return pendingRequests.get(normalizedPath);
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 9500);

  const requestPromise = (async () => {

    try {

      const url = BASE_URL + normalizedPath;

      const response = await fetch(url, {
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.error("Erro HTTP GitHub:", response.status, url);
        return "";
      }

      const text = await response.text();

      if (!text || !text.trim()) {
        console.warn("Arquivo vazio no GitHub:", url);
      }

      cache.set(normalizedPath, text);

      return text;

    } catch (error) {

      clearTimeout(timeout);

      if (error.name === "AbortError") {
        console.error("Timeout ao acessar GitHub:", normalizedPath);
      } else {
        console.error("Erro ao acessar GitHub:", normalizedPath, error);
      }

      return "";

    } finally {

      pendingRequests.delete(normalizedPath);

    }

  })();

  pendingRequests.set(normalizedPath, requestPromise);

  return requestPromise;

}
