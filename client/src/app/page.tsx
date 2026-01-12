type HealthResult = {
  status: string;
  error?: string;
};

type PostResult = {
  value?: string;
  error?: string;
};

const defaultApiUrl = "http://localhost:3001";

async function fetchHealth(): Promise<HealthResult> {
  const apiUrl = process.env.API_URL ?? defaultApiUrl;

  try {
    const response = await fetch(`${apiUrl}/health`, { cache: "no-store" });

    if (!response.ok) {
      return { status: "unhealthy", error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as { status?: string };
    return { status: data.status ?? "ok" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return { status: "unreachable", error: message };
  }
}

async function fetchFirstPost(): Promise<PostResult> {
  const apiUrl = process.env.API_URL ?? defaultApiUrl;

  try {
    const response = await fetch(`${apiUrl}/posts/first`, { cache: "no-store" });

    if (!response.ok) {
      return { error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as { value?: string };
    return { value: data.value ?? "No data" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return { error: message };
  }
}

export default async function Home() {
  const health = await fetchHealth();
  const post = await fetchFirstPost();

  return (
    <main className="container">
      <div className="badge">Nest + Next</div>
      <h1>It works</h1>
      <p className="lead">
        Your monorepo is running. Frontend and backend are wired together.
      </p>
      <div className="card">
        <div className="card-title">Backend health</div>
        <div className="card-value">{health.status}</div>
        {health.error ? (
          <div className="card-error">{health.error}</div>
        ) : null}
      </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-title">DB check</div>
        {post.value ? (
          <div className="card-value">{post.value}</div>
        ) : (
          <div className="card-error">{post.error ?? "No data"}</div>
        )}
      </div>
    </main>
  );
}
