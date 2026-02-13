/** Shared CORS headers for all gateway routes. */
export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** 204 response for OPTIONS preflight. */
export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/** Wrap a JSON body with CORS headers. */
export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
