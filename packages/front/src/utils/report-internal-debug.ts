type DebugPayload = {
  source?: string;
  sessionId: string;
  runId?: string;
  hypothesisId: string;
  location: string;
  msg: string;
  data?: Record<string, unknown>;
  ts?: number;
};

export const reportInternalDebug = (payload: DebugPayload) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_REST_API_ENDPOINT;

  if (!apiBaseUrl) {
    return;
  }

  const endpoint = `${apiBaseUrl.replace(/\/$/, '')}/frontend-debug-events`;

  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    body: JSON.stringify({
      source: payload.source ?? 'front',
      ...payload,
      data: payload.data ?? {},
      ts: payload.ts ?? Date.now(),
    }),
  }).catch(() => {});
};
