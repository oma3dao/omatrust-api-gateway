import { optionsResponse, jsonResponse } from '../_shared/cors';

export const config = { runtime: 'edge' };

/**
 * Trust policy for OMATrust widget signing bridges.
 *
 * Returns the allowlists of EAS contracts and schemas that the SDK
 * uses to validate signing requests. Clients fetch this on bridge
 * creation and reject any request that doesn't match.
 *
 * This is a static response for now. When the backend repository is
 * created, this route will proxy to it instead.
 */

const TRUST_POLICY = {
  version: 1,
  updatedAt: "2026-04-13T00:00:00Z",
  widgetOrigins: [],
  chains: {
    "66238": {
      name: "OMAchain Testnet",
      easContract: "0x8835AF90f1537777F52E482C8630cE4e947eCa32",
      schemas: [
        "0x7ab3911527e5e47eaab9f5a2c571060026532dde8cb4398185553053963b2a47", // User Review
        "0x26e21911c55587925afee4b17839ab091e9829321b4a4e1658c497eb0088b453", // Linked Identifier
        "0x807b38ce9aa23fdde4457de01db9c5e8d6ec7c8feebee242e52be70847b7b966", // Key Binding
        "0xc81419f828755c0be2c49091dcad0887b5ca7342316dfffb4314aadbf8205090", // Controller Witness
      ],
    },
  },
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return optionsResponse();

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  return jsonResponse(TRUST_POLICY, 200);
}
