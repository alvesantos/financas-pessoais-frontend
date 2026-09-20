const API_URL = process.env.VITE_API_URL ?? "http://localhost:8080/api";

/**
 * Falha cedo e com instrução clara quando a API não está no ar. Sem isso,
 * todo teste quebraria com um erro de rede sem explicação.
 */
export default async function globalSetup() {
  try {
    const response = await fetch(`${API_URL}/health/ready`);

    if (!response.ok) {
      throw new Error(`/health/ready respondeu ${response.status}`);
    }
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);

    throw new Error(
      `API indisponível em ${API_URL}: ${motivo}\n\n` +
        `Suba a API antes dos testes e2e:\n` +
        `  cd ../backend && make db-up && make run\n`,
    );
  }
}
