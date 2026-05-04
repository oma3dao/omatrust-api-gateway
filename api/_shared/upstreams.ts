declare const process: { env: Record<string, string | undefined> };

/**
 * Service URL construction for the API gateway.
 *
 * Derives upstream URLs from the active chain and base domains.
 * The active chain determines the environment prefix:
 *
 *   omachain-mainnet  → no prefix
 *   omachain-testnet  → preview.
 *   omachain-devnet   → dev.
 *
 * If a domain contains "localhost" or a port, it's used as-is with http://.
 */

const CHAIN_PREFIX_MAP: Record<string, string> = {
  "omachain-mainnet": "",
  "omachain-testnet": "preview.",
  "omachain-devnet": "dev.",
};

function getActiveChainKey(): string {
  return process.env.OMATRUST_ACTIVE_CHAIN ?? "omachain-testnet";
}

function isLocalDomain(domain: string): boolean {
  return (
    domain.includes("localhost") ||
    domain.includes("127.0.0.1") ||
    /:\d+/.test(domain)
  );
}

export function buildServiceUrl(baseDomain: string): string {
  if (baseDomain.startsWith("http")) return baseDomain.replace(/\/+$/, "");

  if (isLocalDomain(baseDomain)) {
    return `http://${baseDomain}`.replace(/\/+$/, "");
  }

  const chain = getActiveChainKey();
  const prefix = CHAIN_PREFIX_MAP[chain] ?? "preview.";
  return `https://${prefix}${baseDomain}`.replace(/\/+$/, "");
}

// ---------------------------------------------------------------------------
// Upstream origins
// ---------------------------------------------------------------------------

const BACKEND_DOMAIN = process.env.OMATRUST_BACKEND_DOMAIN ?? "backend.omatrust.org";
const REPUTATION_DOMAIN = process.env.OMATRUST_REPUTATION_DOMAIN ?? "app.omatrust.org";
const REGISTRY_DOMAIN = process.env.OMATRUST_REGISTRY_DOMAIN ?? "registry.omatrust.org";

export const BACKEND_ORIGIN = buildServiceUrl(BACKEND_DOMAIN);
export const REPUTATION_ORIGIN = buildServiceUrl(REPUTATION_DOMAIN);
export const REGISTRY_ORIGIN = buildServiceUrl(REGISTRY_DOMAIN);
