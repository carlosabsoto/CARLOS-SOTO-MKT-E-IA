const BASE_URL =
  "https://raw.githubusercontent.com/Carlos-Soto-MKT/IAs-Ser-Magnetico/refs/heads/main/";

export async function fetchFromGitHub(path) {
  const response = await fetch(BASE_URL + path);

  if (!response.ok) {
    throw new Error(`Erro ao buscar ${path}`);
  }

  return await response.text();
}
