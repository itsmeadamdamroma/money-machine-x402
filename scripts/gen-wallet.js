import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import fs from "fs";
const pk = generatePrivateKey();
const account = privateKeyToAccount(pk);
const env = `# x402 scrape seller wallet (Base) — KEEP SECRET
EVM_PRIVATE_KEY=${pk}
EVM_ADDRESS=${account.address}
# Base mainnet for real USDC
NETWORK=eip155:8453
# prices
PRICE_SCRAPE=$0.05
PRICE_DEMO=$0.01
PORT=4021
`;
fs.writeFileSync(".env", env, { mode: 0o600 });
console.log("Wallet created:");
console.log("  address:", account.address);
console.log("  wrote .env (mode 600)");
console.log("");
console.log("FUND THIS ADDRESS ON BASE:");
console.log("  1) ~$1–2 ETH for gas (self-facilitator settle)");
console.log("  2) Buyers send USDC to this same address when they pay");
