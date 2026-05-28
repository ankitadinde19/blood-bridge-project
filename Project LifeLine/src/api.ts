export async function apiFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {

  const token =
      localStorage.getItem('lifelink_token');

  const headers = new Headers(
      init?.headers || {}
  );

  // Auto attach token
  if (token) {

    headers.set(
        'Authorization',
        `Bearer ${token}`
    );
  }

  // Default JSON header
  if (!headers.has('Content-Type')) {

    headers.set(
        'Content-Type',
        'application/json'
    );
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  // Auto logout on invalid token
  if (response.status === 401 && token) {

    localStorage.removeItem(
        'lifelink_token'
    );

    window.location.href = '/';
  }

  return response;
}